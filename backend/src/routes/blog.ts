import { PrismaClient } from "@prisma/client/edge";
import { getPostInstallTrigger } from "@prisma/client/scripts/postinstall.js";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { Variables } from "hono/types";
import {createBlogInput,updateBlogInput} from "rm347711-common"



export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    },
    Variables : {
        userId: string,
    }
}>()

// Middleware
blogRouter.use('/*', async (c, next) => {
    const header = c.req.header('authorization') || ''
    const token = header.split(' ')[1]

    const response = await verify(token, c.env.JWT_SECRET)

    if (response) {
        c.set("userId", response.id as string);
        await next()
    }
    else {
        c.status(403)
        return c.json({ error: "Unauthorized" })
    }
})

// blog creation route
blogRouter.post('/', async (c) => {
    const body = await c.req.json()
    const {success}= createBlogInput.safeParse(body)
    if(!success){
        c.status(411)
        return c.json({
            message:'Invalid input'
        })
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const authorId = c.get('userId')
    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: authorId
        }
    })

    return c.json({
        id: post.id
    })
}) 

// blog update route
blogRouter.put('/', async (c) => {
    const body = await c.req.json()
    const {success}=updateBlogInput.safeParse(body)
    if(!success){
        c.status(411)
        return c.json({
            message: 'Invalid input'
        })
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

   
    const post = await prisma.post.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content,
        }
    })

    return c.json({
        id: post.id
    })
})


// returning all blog route
blogRouter.get('/bulk',async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const post = await prisma.post.findMany({})

        return c.json({
            posts: post
        })

    } catch (error) {
        c.status(411)
        return c.json({ error: "Error while fetching the posts" })

    }

})


//first blog find route
blogRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const id =  c.req.param("id")
    try {
        const post = await prisma.post.findFirst({
            where: {
                id: id
            },
        })

        return c.json({
            post: post
        })

    } catch (error) {
        c.status(411)
        return c.json({ error: "Error while fetching the posts" })

    }
})


