//https://github.com/apollographql/apollo-server/issues/1989

const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require('faunadb'),
  q = faunadb.query;


const typeDefs = gql`
type Query {
  todos: [Todo]!
}

type Todo {
  id: ID!
  text: String!
  status: Boolean!
}

type Mutation {
  addTodo(text: String!): Todo
  updateTodo(id: ID!, status: Boolean!): Todo
  deleteTodo(id: ID!): Todo
}
`;


const todos = {};
let todoIndex = 0;
var client = new faunadb.Client({ secret: process.env.FAUNADB_ADMIN_SECRET });

const resolvers = {
  Query: {
    
    todos: async (parent, args, context) => {
      try {
        
        let result = await client.query(
          //q.Get(q.Map(q.Collection('todos')))
          q.Paginate(q.Match(q.Index("todos_owner"), 'admin'))
        );
        //console.log('this is ',result);
        return result.data.map(([ref, id, text, status]) => ({
          id: ref.id,
          uid: id,
          text,
          status
        }));
    } catch (err) {
      return err.toString();
    }
  }
  
  },


  Mutation: {
    addTodo: async (_, { text }) => {
      try {        
        const result = await client.query(
          q.Create(q.Collection("todos"), {
            data: {
              text,
              status: false,
              owner: 'admin'
            },
          })
        );
        // console.log(result.data.task);
        return { ...result.data,
          id: result.ref.id}
      } catch (error) {
        return error.toString();
      }
    },
    deleteTodo: async (_, { id }) => {
      try {
        
        const result = await client.query(
          q.Delete(q.Ref(q.Collection("todos"), id))
        );
        console.log("after delete" ,result);
        return result.data;
      } catch (error) {
        return error;
      }
    },
    updateTodo: async (_, { id , status }) => {
      try {        
        
        const result = await client.query(
          q.Update(q.Ref(q.Collection("todos"), id),{
            data: {
              
              status: status
            }
          })
        );
        console.log(result);
        return result.data;
      } catch (error) {
        return error;
      }
    },
  },
};
  

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true
});

exports.handler = server.createHandler();





