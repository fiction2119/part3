// Load environment variables from .env file
require('dotenv').config()

// Import required modules and models
const Person = require('./models/person') // Mongoose model for Person
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

// Initialize express application
const app = express()

// Morgan middleware for logging request details. Custom token 'body' logs the request body for POST requests.
morgan.token('body', (req) => {
	return req.method === 'POST' ? JSON.stringify(req.body) : ''
})
app.use(morgan(':method :url :status :response-time ms - body :body'))

// Middleware
app.use(cors()) // Enable CORS for all routes
app.use(express.static('dist')) // Serve static files from 'dist' directory
app.use(express.json()) // Parse JSON request bodies

// Route to fetch all persons from the database
app.get('/api/persons', (request, response) => {
	Person.find({}).then(persons => {
		response.json(persons)
	})
})

// Route to display information about the phonebook
app.get('/api/info', (request, response) => {
	Person.countDocuments({})
		.then(count => {
			const currentDate = new Date().toLocaleString()
			response.send(`<p>Phonebook has info for ${count} people<br/>${currentDate}</p>`)
		})
		.catch(error => response.status(500).send(`${error}`))
})

// Route to fetch a single person by ID
app.get('/api/persons/:id', (request, response, next) => {
	console.log('Querying for ID:', request.params.id) // Log the ID being requested
	Person.findById(request.params.id)
		.then(person => {
			console.log('Found person:', person) // Log the result of the query
			if (person) {
				response.json(person)
			} else {
				console.log('No person found for ID:', request.params.id) // Log if no person is found
				response.status(404).end()
			}
		})
		.catch(error => {
			console.error('Error fetching person:', error) // Log any errors encountered
			next(error)
		})
})

// Route to delete a person by ID
app.delete('/api/persons/:id', (request, response, next) => {
	const id = request.params.id
	Person.findOneAndDelete({ _id: id })
		.then(result => {
			if (result) {
				response.status(204).end()
			} else {
				response.status(404).json({ error: 'Person not found with the provided ID' })
			}
		})
		.catch(error => next(error)) // Pass errors to error handling middleware
})

// Route to add a new person
app.post('/api/persons', (request, response, next) => {
	const { name, number } = request.body
	if (!name || !number) {
		return response.status(400).json({ error: 'The name and number must be provided.' })
	}
	const person = new Person({ name, number })
	person.save()
		.then(savedPerson => response.json(savedPerson))
		.catch(error => next(error)) // Handle validation errors or other save issues
})

// Start the server
const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
