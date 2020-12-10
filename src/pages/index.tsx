import React, { useRef, useState } from "react"
import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag';





import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import { Button, TextField } from "@material-ui/core";
import { blueGrey } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    maxWidth: 752,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
  },
  btn: {
    backgroundColor: '#2362aa',
    
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
}));

function generate(element) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    }),
  );
}



const ADD_TODO = gql`
mutation AddTodo($text: String!){
    addTodo(text: $text){
        id
    }
}
`;
const GET_TODOS = gql`
query GetTodos {
    todos {
        id
        text
        status
    }
}
`
const UPDATE_TODO = gql`
mutation UpdateTodo($id: ID!, $status: Boolean!){
  updateTodo(id: $id, status: $status){
    text
    status
    }
}
`;

const DELETE_TODO = gql`
mutation DeleteTodo($id: ID!){
  deleteTodo(id: $id){
    text
    status
    }
}
`



export default function Home() {
  //const { loading, error, data } = useQuery(APOLLO_QUERY);

  const inputRef = useRef();
  const { loading, error, data, refetch } = useQuery(GET_TODOS);
  const [AddTodo] = useMutation(ADD_TODO)
  const [DeleteTodo] = useMutation(DELETE_TODO)
  const [UpdateTodo] = useMutation(UPDATE_TODO)
  const classes = useStyles();
  const [secondary, setSecondary] = React.useState(true);
  const [todo , setTodo] = useState('');

 
  return (
      <div>
        
        {loading && <p>Loading Client Side Querry...</p>}
        {error && <p>Error: ${error.message}</p>}


        <Grid container spacing={2}>
        
        <Grid item xs={12} md={2}/>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" className={classes.title}>
          Tasks To Do
          </Typography>
        </Grid>
        <Grid item xs={12} md={2}/>
        <Grid item xs={12} md={2}/>
        <Grid item xs={12} md={8}>
        
       {/*  {!loading && !error && (
         
            <ul >                
                {data.todos.map((todo) => (
                      
                      
                          <li>{todo.text}</li>
                        ))}
                     
                    </ul> )} */}

                    <div className={classes.demo}>
            <List >
              { !loading && !error && console.log('data', data)}
              
            {!loading && !error && (                                          
             data.todos.map((todo) => (
               
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      {(todo.status) ? '🟢' : '🔴' }
                      
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemIcon>
              <Checkbox
                edge="start"
                id="cbox"
                checked={todo.status}
                tabIndex={-1}
                onClick={(e) => {                  
                  //e.preventDefault();                  
                  UpdateTodo({ variables: { id: todo.id, status: !todo.status},
                    refetchQueries: [{ query: GET_TODOS }],
                  });
                }}
                disableRipple
                inputProps={{ 'aria-labelledby': '' }}
              />
            </ListItemIcon>
                  <ListItemText
                    primary={todo.text}
                    secondary={todo.status ? 'Completed' : 'Not Completed'}
                  />
                  <ListItemSecondaryAction 
                  onClick={() => {
                    console.log("deleted", todo.id);
                    DeleteTodo({ variables: { id: todo.id},
                      refetchQueries: [{ query: GET_TODOS }],
                    });
                  }}>

                    <IconButton edge="end" aria-label="delete" >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
             


              ))
                     
                   )}
            </List>
          </div>
          </Grid>
          <Grid item xs={12} md={2}/>
          <Grid item xs={12} md={2}/>
        <Grid item xs={12} md={8}>
           {<form

          onSubmit={async e => {
            e.preventDefault();
            await AddTodo({ variables: { text: todo},
              refetchQueries: [{ query: GET_TODOS }],
            });
                            
            setTodo("");

          }}>
     
     <TextField
                  fullWidth
                  variant="outlined"
                  value={todo}
                  onChange={(e) => setTodo(e.target.value)}
                  label="Add New Todo"                  
                  name="todo"
                 // ref={ inputRef }
                  required
                />

          <br/> <br/>
          <Button type="submit" variant="contained" color="primary" style={{alignContent:'center'}}>Submit</Button>
        </form> }
         
          </Grid>
          <Grid item xs={12} md={2}/>
        </Grid>
                
    


        
      </div>
  );
    
}
