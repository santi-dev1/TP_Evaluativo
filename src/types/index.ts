import { JwtPayload } from "jsonwebtoken"

export type Payload = {
    id: number
    email: string
    rol: string
}

export type JWTPayload = JwtPayload & Payload