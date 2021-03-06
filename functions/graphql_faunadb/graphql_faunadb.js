//https://github.com/apollographql/apollo-server/issues/1989

const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require('faunadb'),
q = faunadb.query;
  require("dotenv").config()

const typeDefs = gql`
type Query {
  todos: [Todo!]
}

type Todo {
  id: ID
  text: String!
  status: Boolean!
}

type Mutation {
  addTodo(text: String!): Todo
  updateTodo(id: ID!, status: Boolean!): Todo
  deleteTodo(id: ID!): Todo
}
`;


//const todos = {};
//let todoIndex = 0;
var client = new faunadb.Client({ secret: process.env.FAUNADB_ADMIN_SECRET });

const resolvers = {
  Query: {
    
    todos: async (parent, args, context) => {
      try {
        let result = await client.query(   
        q.Map(
          q.Paginate(q.Documents(q.Collection('todos'))),
          q.Lambda(x => q.Get(x))
        )
        );
        
        return result.data.map((d) => ({
          id: d.ref.id,                    
          text: d.data.text,
          status: d.data.status
        }));


        // console.log('in')
        // let result = await client.query(          
        //   q.Paginate(q.Match(q.Index("todos_owner"), 'admin'))
        // );
        // console.log('this is ',result);
        // result.data.map(([ref, uid, text, status]) => {
        //   console.log(ref.id)
        //   console.log(uid)
        //   console.log(text)
        //   console.log('status', status)
        // })
          
        // return result.data.map(([ref, uid, text, status]) => ({
        //   id: ref.id,                    
        //   text: text,
        //   status: status
        // }));

        
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
              text: text,
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





