import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Redis } from '@upstash/redis'

function getRedis() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.REDIS_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    return null
  }
  return new Redis({ url, token })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const redis = getRedis()
  if (!redis) {
    return res.status(503).json({
      error: 'Base de datos no detectada. Asegúrate de vincular Upstash Redis en Vercel.',
    })
  }

  try {
    if (req.method === 'GET') {
      const { id } = req.query
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Falta el código del torneo' })
      }

      const key = `padel:${id.toUpperCase().trim()}`
      const tournament = await redis.get(key)
      if (!tournament) {
        return res.status(404).json({ error: 'Torneo no encontrado' })
      }

      return res.status(200).json(tournament)
    }

    if (req.method === 'POST') {
      const tournament = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (!tournament) {
        return res.status(400).json({ error: 'Datos de torneo vacíos' })
      }

      const code = (tournament.code || tournament.id || 'TORNEO').toUpperCase().trim()
      const key = `padel:${code}`

      // Guardar en Upstash por 30 días
      await redis.set(key, tournament, { ex: 2592000 })

      return res.status(200).json({ success: true, code })
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Error del servidor al procesar la solicitud' })
  }
}
