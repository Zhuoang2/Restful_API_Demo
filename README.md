# Task Manager API

This project is a RESTful API built with **Node.js**, **Express**, and **Mongoose**, connected to a **MongoDB Atlas** database. It manages Users and Tasks with full CRUD functionality and supports advanced querying.

## Features

- **Manage Users and Tasks** with CRUD operations.
- **Advanced querying**: filtering, sorting, field selection, pagination, and counting.
- **Two-way referencing** between Users and Tasks.
- **Server-side validation** of required fields.
- **Proper HTTP status codes** and error messages.
- **Standardized responses** with `message` and `data` fields.

## Getting Started

### Prerequisites

- **Node.js** (version 14.x or newer)
- **npm** (Node Package Manager)
- **MongoDB Atlas** account (free tier is sufficient)

### Installation

1. **Clone the repository**:

   ```
   git clone https://github.com/your-username/task-manager-api.git
   cd task-manager-api

2. **Install dependencies**:

   ```
   npm install

3. **Set up MongoDB Atlas**:
- **Create a cluster on MongoDB Atlas.**
- **Create a database user with username and password.**
- **Whitelist your IP address (use `0.0.0.0/0` for access from anywhere during development).**
- **Get the connection string from the "Connect" section.**

## Goals

**The Basic Goal** : Create an API for a task management / todo list.

**The Fun Goal** : Imagine your hot new startup, Llama.io, is creating the best todo webapp on the market. You're competing in a crowded space with hot players like Asana, Wunderlist, Google Keep, etc, so your API has to be top-notch.

#### Task

 Implement an API with the following end-points (they would be preceded by something like http://localhost:4000/api/). Your implementation should use Node, Express and Mongoose.


| Endpoints| Actions | Intended Outcome                                    |
|----------|---------|-----------------------------------------------------|
| users    | GET     | Respond with a List of users                        |
|          | POST    | Create a new user. Respond with details of new user |
| users/:id| GET     | Respond with details of specified user or 404 error |
|          | PUT     | Replace entire user with supplied user or 404 error |
|          | DELETE  | Delete specified user or 404 error                  |
| tasks    | GET     | Respond with a List of tasks                        |
|          | POST    | Create a new task. Respond with details of new task |
| tasks/:id| GET    | Respond with details of specified task or 404 error  |
|          | PUT     | Replace entire task with supplied task or 404 error |
|          | DELETE  | Delete specified task or 404 error                  |

**NOTE**: In addition, the API has the following JSON encoded query string parameters for the GET requests to the `users` and `tasks` endpoints. You will also need to make sure the [+select+] parameter works for the `users/:id` and `tasks/:id` endpoints.:

| Parameter | Description                                                                                  |
|----------|----------------------------------------------------------------------------------------------|
| where    | filter results based on JSON query                                                           |
| sort     | specify the order in which to sort each specified field  (1- ascending; -1 - descending)     |
| select   | specify the set of fields to include or exclude in each document  (1 - include; 0 - exclude) |
| skip     | specify the number of results to skip in the result set; useful for pagination               |
| limit    | specify the number of results to return (default should be 100 for tasks and unlimited for users)                    |
| count    | if set to true, return the count of documents that match the query (instead of the documents themselves)                    |

Here are some example queries and what they would return:

| Query                                                                                | Description                                             |
|-----------------------------------------------------------------------------------------|---------------------------------------------------------|
| `http://localhost:4000/api/tasks`                          | Returns full list of  tasks                       |
| `http://localhost:4000/api/users`                          | Returns full list of users                       |
| `http://localhost:4000/api/users?where={"_id": "55099652e5993a350458b7b7"}`         | Returns a list with a single user with the specified ID ('_id' will be different) |
| `http://localhost:4000/api/tasks?where={"completed": true}`                          | Returns a list of completed tasks                       |
| `http://localhost:4000/api/tasks?where={"_id": {"$in": ["59f930d6b1596b0cb3e82953","5a1b6d7bd72ba9106fe9239c"]}}` | Returns a set of tasks                                  |
| `http://localhost:4000/api/users?sort={"name": 1}`                                  | Returns a list of users sorted by name                  |
| `http://localhost:4000/api/users?select={"_id": 0}`                                  | Returns a list of users without the _id field           |
| `http://localhost:4000/api/tasks?skip=60&limit=20`                                   | Returns tasks number from 61 to 80                            |

**The API should be able to handle any combination of those parameters in a single request**. For example, the following is a valid GET request:

```javascript
http://localhost:4000/api/users?sort={"name": 1}&skip=60&limit=20
```

Here is the User Schema:

1. "name" - String
2. "email" - String
3. "pendingTasks" - [String] - The \_id fields of the *pending* tasks that this user has
4. "dateCreated" - Date - should be set automatically by server

Here is the Task Schema:

1. "name" - String
2. "description" - String
3. "deadline" - Date
4. "completed" - Boolean
5. "assignedUser" - String - The \_id field of the user this task is assigned to - default ""
6. "assignedUserName" - String - The name field of the user this task is assigned to - default "unassigned"
7. "dateCreated" - Date - should be set automatically by server to present date

**We assume that each task can be assigned only to one user.**

#### Requirements

1. Your database should be on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). It should contain at least 20 users and 100 tasks (about half of which should be completed) (**We provided scripts for you in the database_scripts folder. Read below how to use these scripts**). ***NOTE: Please add "Allow access from anywhere" to your cluster in the IP Whitelist"*** (This is usually not a good practice in real use. Here is just easier for us to grade your mp) 

2. Responses from your API should be a JSON object with two fields. The first field should be named `message` and should contain a human readable String. The second field should be named `data` and should contain the actual JSON response object. For example, here is a valid response:

```javascript
{
    "message": "OK",
    "data": {
        "_id": "55099652e5993a350458b7b7",
        "email": "khandek2@illinois.edu",
        "name": "Sujay Khandekar"
    }
}
```

3. Error responses from your API should also also be a JSON object with a `message` and `data` fields. Messages have to sensible and human readable so that on the client side it can be displayed to the user. Also, it should be independent of the server side technology that you are using. For example, your API should not return an error message directly from Mongoose to the client.

4. Your API should respond with appropriate [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html) for both successful and error responses. You should at least have the following codes: 200 (success), 201 (created), 404 (not found), 500 (server error).

5. You should implement the query string functionality by using the methods provided by Mongoose (as opposed to querying Mongoose for all the results and then doing the filtering/sorting/skipping etc. in your Node/Express application code).

6. Have server side validation for:
    - Users cannot be created (or updated) without a name or email. All other fields that the user did not specify should be set to reasonable values.
    - Multiple users with the same email cannot exist.
    - Tasks cannot be created (or updated) without a name or a deadline. All other fields that the user did not specify should be set to reasonable values.

7. Your API should guarantee two-way reference between Task and User for the following methods:
    - PUT a Task with assignedUser and assignedUserName
    - DELETE a Task should remove the task from its assignedUser's pendingTasks
    - PUT a User with pendingTasks
    - DELETE a User should unassign the user's pending tasks

### How to use the DB Scripts

Assuming your API is fully operational (you need to have implement /users and /tasks endpoints for your API), these scripts (in database_scripts/ folder) will populate and clear your database as needed. 

**dbClean.py**

   ```
   python3 dbClean.py -u "localhost" -p 4000
   ```

You can change "localhost" and the port number to match your own running api server. Leave the quotation marks. DO NOT include "/api/" or "/user" etc.

**dbFill.py**

   ```
   python3 dbFill.py -u "localhost" -p 4000 -n 20 -t 100
   ```

Once again, change the url and port number to match your own running api server. You can populate your database with X users and Y tasks (in the above case, 20 and 100 respectively). This will randomly generate users with realistic names and emails as well as realistic tasks. Tasks will have a 50% chance of being completed and a 60% chance of being assigned. If num_tasks >> num_users, users will likely have multiple tasks assigned to them. A task will have one assigned user at most.

**task.txt**

Contains sample task descriptions. Edit if you want.
