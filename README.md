FSE Chatroom
==============

This is a web-based chatroom application done as a part of Foundation of Engineering course.
--------------

**Application Usecases**

The chat room allows a user to:
- Enter the chat room with his/her name
- See other users’ chat messages
- Post a chat message 
- Leave the chat room 

**Technology Used**

Client side: HTML, CSS, JavaScript
Server side: Node.js with express.js web development framework
Database: SQLite 

The application serves these rules:
- When a user posts a chat message, the text is displayed together with the user’s name and current timestamp. 
- When there is a new post, the chat room is dynamically updated on all the screens of the users in the chat room (the updates are real time on all client browsers). 
- All the chat messages are stored on the server in a database and loaded when a user exits and re-enters the chat room. 

![alt tag](https://raw.githubusercontent.com/keerthanat/chatRoom/master/images/DemoLandingPage.jpg)
![alt tag](https://raw.githubusercontent.com/keerthanat/chatRoom/master/images/DemoChatPage.png)
