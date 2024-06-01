### How does the websocket connection work in my case?

First an identification message is sent to the server.
```json
{
  "type": "identification",
  "id": "web"
}
```
or in the case of farm connecting to the server
```json
{
  "type": "identification",
  "id": "farm"
}
```
The server stores the id and an underlying websocket connection in an object. (Storing it in an object is a viable option here, because I expect only one connection from each side (id))

After the identification, messages continue in this format:
```json
{
  "id": "web",
  "message": "Some message"
}
```
or in the case of farm sending data
```json
{
  "id": "farm",
  "message": {
    "pH": 7.5,
    "EC": 1.2,
    "Temp": 23.4,
    "Distance": 12.3
  }
}
```
### Disconnecting
When either of the clients disconnect, they try connecting again with a falloff indefinitely.

### Sending data from server
The server chooses a web/farm id from the object of connected clients and sends a normal message to it (not an object)




