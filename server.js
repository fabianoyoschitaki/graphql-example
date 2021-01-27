const express = require('express')
const expressGraphQL = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const app = express()

// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: 'HelloWorld',
//         fields: () => ({
//             message: { 
//                 type: GraphQLString,
//                 resolve: () => 'Hello World'
//             }
//         })
//     })
// })

// data simulating books coming from database
const books = [
    { id: 1, name: 'Java', authorId: 1},
    { id: 2, name: 'Javascript', authorId: 1},
    { id: 3, name: 'Android', authorId: 2},
    { id: 4, name: 'Swift', authorId: 2},
    { id: 5, name: 'GraphQL', authorId: 3},
    { id: 6, name: 'Docker', authorId: 3},
    { id: 7, name: 'Kubernetes', authorId: 3},
    { id: 8, name: 'Kafka', authorId: 4}
]

// data simulating authors coming from database
const authors = [
    { id: 1, name: 'Joao'},
    { id: 2, name: 'Joaquim'},
    { id: 3, name: 'Pedro'},
    { id: 4, name: 'Rubio'}
]

// defining author type (structure)
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Author of books',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: { 
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

// defining book type (structure)
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        // author with same id == authorId will be returned here
        author: { 
            type: GraphQLNonNull(AuthorType),
            resolve: (book) => {
                return authors.find(author => book.authorId === author.id)
            }
        }
    })
})

// root is a list of books
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        // single book
        book: {
            type: BookType,
            description: 'A single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        bookByName: {
            type: BookType,
            description: 'A single book fetched by name',
            args: {
                name1: { type: GraphQLString }
            },
            resolve: (parent, args) => books.find(book => book.name === args.name1)
        },
        // single author
        author: {
            type: AuthorType,
            description: 'A single author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        // all books
        books: {
            type: new GraphQLList(BookType),
            description: 'List of all books',
            resolve: () => books
        },
        // all authors
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all authors',
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutations',
    description: 'Root mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLString }
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name
                }
                authors.push(author)
                return author
            }
        }
    })
})

// schema is the RootQueryType
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

// opening graphql endpoint with schema = RootQueryType
app.use('/graphql', expressGraphQL.graphqlHTTP({ 
    schema: schema,
    graphiql: true
}))

// opening port 5000
app.listen(5000., () => console.log('Server is running'))