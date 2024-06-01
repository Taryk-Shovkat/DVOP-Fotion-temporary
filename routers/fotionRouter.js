const express = require('express');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

//database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fotionRouter = express.Router();

const app = express();


module.exports = (io, prisma) => {
    const nsp = io.of('/ranajakub/fotionapi');

    let connections = []; // [{connectionId, userId, socket}]

    // (async () => {
    //     console.log(await prisma.fotion_block.deleteMany({}))
    //     console.log(await prisma.fotion_page.deleteMany({}))
    //     console.log(await prisma.fotion_user.deleteMany({}))

    //     const page = await prisma.fotion_page.create({
    //         data: {
    //             title: "Toto je název stránky",
    //             blocks: {
    //                 create: [{
    //                     type: "TEXT",
    //                     text_type: "H1",
    //                     content: "Toto je největší nadpis",
    //                     order: 0
    //                 },
    //                 {
    //                     type: "TEXT",
    //                     content: "Toto je normální text",
    //                     order: 1
    //                 }]
    //             }
    //         }
    //     })

    //     await prisma.fotion_user.deleteMany({})

    //     await prisma.fotion_user.create({
    //         data: {
    //             id: "8bcae52d-8b44-4be8-8c83-df07be564f25",
    //             providerId: "123",
    //             email: "hello@ranajakub.com",
    //             name: "Jakub Rana",
    //             provider: "X",
    //             fotionPages: {
    //                 connect: {
    //                     id: page.id
    //                 }
    //             }
    //         }
    //     })

    //     await prisma.fotion_user.create({
    //         data: {
    //             id: "af8f05df-81c9-4f68-a628-c0b878842e72",
    //             providerId: "12srg3",
    //             email: "kubik.rana@gmail.com",
    //             name: "Jakub Rana 2",
    //             provider: "X",
    //             fotionPages: {
    //                 connect: {
    //                     id: page.id
    //                 }
    //             }
    //         }
    //     })
    // })()

    nsp.on('connection', (socket) => {
        const userId = socket.handshake.query.id;
        console.log("New connection: ", userId);

        // todo: user authentication
        const currentConnection = { connectionId: uuidv4(), userId: userId, socket: socket };
        connections.push(currentConnection);

        socket.on("disconnect", () => {
            connections = connections.filter(connection => connection.connectionId !== currentConnection.connectionId);
        })

        socket.on("close", () => {
            connections = connections.filter(connection => connection.connectionId !== currentConnection.connectionId);
        })

        // {
        //   item: "item",
        //   content: "content",
        //   pageId: "pageId",
        //   blockId: "blockId",
        //   date: new Date().getTime()
        // }
        socket.on("pageChange", async (data) => {
            const userHasAccessToThisPage = await prisma.fotion_page.findFirst({
                where: {
                    id: data.pageId,
                    users: {
                        some: {
                            id: currentConnection.userId
                        }
                    }
                }
            })

            if (!userHasAccessToThisPage) {
                socket.emit("error", "You do not have permission to modify this page.");
                return;
            }

            if (data.item === "title") {
                await prisma.fotion_page.update({
                    where: {
                        id: data.pageId,
                    },
                    data: {
                        title: data.content
                    }
                })
            } else if (data.item === "blockText") {
                await prisma.fotion_block.update({
                    where: {
                        id: data.blockId,
                        pageId: data.pageId
                    },
                    data: {
                        content: data.content
                    }
                })
            } else if (data.item === "newBlock") {
                await prisma.fotion_block.create({
                    data: {
                        pageId: data.pageId,
                        id: data.blockId,
                        order: data.order,
                        content: data.content,
                    }
                })

                await prisma.fotion_block.updateMany({
                    where: {
                        pageId: data.pageId,
                        id: {
                            not: data.blockId
                        },
                        order: {
                            gte: data.order
                        }
                    },
                    data: {
                        order: {
                            increment: 1
                        }
                    }
                })
            } else if (data.item === "deleteBlock") {
                const block = await prisma.fotion_block.findFirst({
                    where: {
                        id: data.blockId,
                        pageId: data.pageId
                    }
                })

                await prisma.fotion_block.delete({
                    where: {
                        id: data.blockId,
                        pageId: data.pageId
                    }
                })

                await prisma.fotion_block.updateMany({
                    where: {
                        pageId: data.pageId,
                        order: {
                            gte: block.order
                        }
                    },
                    data: {
                        order: {
                            decrement: 1
                        }
                    }
                })
            }

            // const connectionsThatHaveAccessToThisPage = (await prisma.fotion_user.findMany({
            //     where: {
            //         fotionPages: {
            //             some: {
            //                 id: data.pageId
            //             }
            //         }
            //     }
            // })).map(user => connections.find(connection => connection.userId === user.id)).filter(connection => connection !== undefined).filter(connection => connection.connectionId !== currentConnection.connectionId);

            const connectionsThatHaveAccessToThisPage = await prisma.fotion_user.findMany({
                where: {
                    fotionPages: {
                        some: {
                            id: data.pageId
                        }
                    }
                }
            });

            const connectionThatWillRecieveEmit = connections.filter(connection => connectionsThatHaveAccessToThisPage.some(user => user.id === connection.userId)).filter(connection => connection.connectionId !== currentConnection.connectionId);

            console.log("connectionThatWillRecieveEmit: ", connectionThatWillRecieveEmit);

            console.log("clientId: ", currentConnection.userId);
            connectionThatWillRecieveEmit.forEach(connection => {
                console.log("Emitting to: ", connection.userId);
                connection.socket.emit("pageChange", data);
            })
        })
    });

    // endpoint to validate user (down bellow)
    // pošleš Ouath ID vrátíš normální UserId který uložim na frontend (localstorage)
    // na frontendu když nejsi přihlášenej tak tě to automaticky přihlásí

    fotionRouter.post('/auth/google', async (req, res) => {
        const accessToken = req.body.message;
        console.log('Received token:', accessToken);

        //console.log('dostal jse mvěc')

        const token = accessToken;
        console.log('¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨')
        console.log(token)
        console.log('¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨')
        try {
            // Zavolání Google API pro získání uživatelských informací
            const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
                headers: {
                    Authorization: `Bearer ${token}`
                }

            })

            // Zpracování odpovědi zde
            console.log("response.data", response.data);
            const { email, name, id } = response.data;
            console.log(email)
            console.log(name)
            console.log(id)

            //save user to DB
            await SaveUserToDB(response.data, token)

            const user = (await prisma.fotion_user.findFirst({
                where: {
                    providerId: id
                }
            }));

            res.json(user);
        } catch (error) {
            console.error('Error fetching user info:', error);
            //res.status(500).json({ error: 'Failed to fetch user info' });
        }
    });

    fotionRouter.use(async (req, res, next) => {
        const userId = req.headers['user-id'];

        const user = await prisma.fotion_user.findFirst({
            where: {
                id: userId
            }
        })

        if (!user) {
            res.status(401).send("User not found");
            return;
        }
        next();
    })

    fotionRouter.get('/page/:pageID', async (req, res) => {
        const pageID = req.params.pageID;
        // check if user has access

        let page = await prisma.fotion_page.findUnique({
            where: {
                id: pageID,
            },
            include: {
                blocks: true
            }
        });

        page.blocks.sort((a, b) => a.order - b.order);

        res.status(200).send(page);
    });

    fotionRouter.get("/page/:pageID/user", async (req, res) => {
        const pageID = req.params.pageID;

        const users = await prisma.fotion_user.findMany({
            where: {
                fotionPages: {
                    some: {
                        id: pageID
                    }
                }
            }
        })

        res.status(200).json(users.map(user => ({ name: user.name, email: user.email })));
    })

    fotionRouter.post("/page/:pageID/user", async (req, res) => {
        const pageID = req.params.pageID;
        const email = req.body.email;

        await prisma.fotion_user.update({
            where: {
                email: email
            },
            data: {
                fotionPages: {
                    connect: {
                        id: pageID
                    }
                }
            }
        })

        res.status(200).send("User added to page");
    })

    fotionRouter.post('/page', async (req, res) => {
        const title = req.body.title;
        const user = req.headers['user-id'];

        const page = await prisma.fotion_page.create({
            data: {
                title: title,
                blocks: {
                    create: [{
                        type: "TEXT",
                        text_type: "P",
                        content: "",
                        order: 0
                    }]
                },
                users: {
                    connect: {
                        id: user
                    }
                }
            },
        });

        console.log(page);

        res.status(200).json({ page: page });
    });

    fotionRouter.get("/page", async (req, res) => {
        const user = req.headers['user-id'];

        const pages = await prisma.fotion_page.findMany({
            where: {
                users: {
                    some: {
                        id: user
                    }
                }
            }
        })

        console.log(pages);
        res.status(200).json(pages);
    })

    async function SaveUserToDB(responseData, token) {
        try {
            const { email, name, id } = responseData;

            let user = await prisma.fotion_user.findFirst({
                where: { providerId: id }
            });

            console.log("user LALAQ", user);

            if (user) {
                user = await prisma.fotion_user.updateMany({
                    where: { providerId: id },
                    data: {
                        accessToken: token,
                        email: email,
                        name: name
                    }
                });
            } else {
                user = await prisma.fotion_user.create({
                    data: {
                        email: email,
                        name: name,
                        provider: 'GOOGLE',
                        providerId: id,
                        accessToken: token,
                        fotionPages: {
                            create: {
                                title: "Untitled page",
                                blocks: {
                                    create: [{
                                        type: "TEXT",
                                        text_type: "P",
                                        content: "",
                                        order: 0
                                    }]
                                }
                            }
                        }
                    }
                });
            }
            console.log("User added")
            console.log(user)
        } catch (error) {
            console.error('Error puting user to DB:', error);
            //res.status(500).json({ error: 'Failed to fetch user info' });
        }
    }
    return fotionRouter;  // Return the configured router
};