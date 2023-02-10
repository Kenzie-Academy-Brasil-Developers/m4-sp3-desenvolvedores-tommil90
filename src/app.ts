import express, { Application } from 'express'
import { createDeveloper, updateDeveloperInfo, listDeveloperByID, listDevelopers, statusOk, updateDeveloper, deleteDeveloper, projectsListByDeveloper } from './logics/developers.logics'
import { startDatabase } from './database'
import { developerExists } from './middlewares/developers.middlewares'
import { createProject, projectsList, projectListbyId, updateProject, deleteProject } from './logics/projects.logics'
import { developerInProjectExists, verifyDataReqProject, verifyDataUpdateReqProject, verifyProjectExists } from './middlewares/projects.middlewares'

const app: Application = express()
app.use(express.json())

app.get('/', statusOk)
app.post('/developers', createDeveloper)
app.post('/developers/:id/infos',developerExists, updateDeveloperInfo)
app.get('/developers/:id',developerExists, listDeveloperByID)
app.get('/developers', listDevelopers)
app.patch('/developers/:id', developerExists, updateDeveloper)
app.patch('/developers/:id/infos',developerExists, updateDeveloperInfo)
app.delete('/developers/:id', developerExists, deleteDeveloper)
app.post('/projects',verifyDataReqProject, developerInProjectExists, createProject)
app.get('/projects', projectsList)
app.get('/projects/:id', projectListbyId)
app.patch('/projects/:id', verifyProjectExists, verifyDataUpdateReqProject, developerInProjectExists, updateProject)
app.delete('/projects/:id', verifyProjectExists, deleteProject)
app.get('/developers/:id/projects',developerExists, projectsListByDeveloper)

app.listen(3000, async () => {
    console.log('Server is running!')
    await startDatabase()
})