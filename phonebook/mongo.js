const mongoose = require('mongoose')


if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const name = process.argv[3]
const number = process.argv[4]

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3
      },
    number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
    name: name,
    number: number,
})

person.save().then(result => {
    console.log(`added ${person.name} number ${person.number} to notebook`)
    mongoose.connection.close()
})