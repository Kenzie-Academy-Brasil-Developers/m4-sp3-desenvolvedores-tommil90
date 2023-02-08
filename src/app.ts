import express, { Application } from 'express'
import { createDeveloper, createDeveloperInfo, listDeveloperByID, statusOk } from './logics'
import { startDatabase } from './database'
import { developerExists } from './middlewares'

const app: Application = express()
app.use(express.json())

app.get('/', statusOk)
app.post('/developers', createDeveloper)
app.post('/developers/:id/infos',developerExists, createDeveloperInfo)
app.get('/developers/:id',developerExists, listDeveloperByID)

app.listen(3000, async () => {
    console.log('Server is running!')
    await startDatabase()
})