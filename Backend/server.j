const express = require('express')

const app = express()

PORT = process.env.PORT || 5000

app.use(express.json())


app.get('/', (req,res) => {
    res.send('Hello, Express!')
} )
app.use((req,res,next) => {
    console.log(`${req.method} ${req.url}`);
    next()
})

let notes = []

app.post('/api/notes',(req,res) => {
    // console.log(req.body);
    
    const note = {id:Date.now(), ...req.body}

    notes.push(note)

    res.send(`note: ${note.id}, has been added `)

} )

app.get('/api/notes', (req,res) => {
    res.json(notes)
})

app.put('/api/notes/:id', (req,res) => {
    const {id} = req.params
    // console.log(req.params);
    
    const noteIndex = notes.findIndex(note => note.id == id) 

    if (noteIndex === -1) {
        res.status(404).send('Note not found')
    }
    notes[noteIndex] = {...notes[noteIndex], ...req.body}
    res.json(notes[noteIndex])
})

app.delete('/api/notes/:id', (req,res) => {
    const {id} = req.params
    notes = notes.filter(note => note.id != id)
    res.send(`note with id ${id} has been deleted successfully`)
})



app.listen(PORT,() => {
    console.log(`server is running on http://localhost:${PORT}`);
})