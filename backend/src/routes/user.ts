import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import {signupInput,signinpInput} from "rm347711-common"


export const userRoute = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>()


userRoute.post('/signup', async (c) => {
    const body = await c.req.json()
    const {success} = signupInput.safeParse(body)
    if(!success){
        c.status(411)
        return c.json({
            message:"invalid input"
        })
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {

        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
            },
        })

        const token = await sign({ id: user?.id }, c.env.JWT_SECRET)

        return c.json({ jwt: token })
    } catch (error) {
        c.status(411)
        return c.text('Invalid')
    }
})

userRoute.post('/signin', async (c) => {
    const body = await c.req.json()
    const {success}=signinpInput.safeParse(body)
    if(!success){
        c.status(411)
        return c.json({
            message: "Invalid input"
        })
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
                password: body.password
            }
        })

        if (!user) {
            c.status(403)
            return c.json({ error: "user does not exist" })
        }

        const token = await sign({ id: user.id }, c.env.JWT_SECRET)

        return c.json({ jwt: token })
    } catch (error) {
        c.status(411)
        return c.text('Invalid')

    }
})