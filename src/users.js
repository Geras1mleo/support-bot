import {readFile, writeFile} from "fs";

export const users_path = "./src/registered_users.json";

export function getUsers() {
    let users = []
    readFile(users_path, "utf8", (error, data) => {
        if (error) {
            console.log(error);
        } else {
            users = JSON.parse(data);
        }
    })
    return users;
}

export function addUser(user, users) {
    console.log("New user:", user)
    users.push(user)
    writeFile(users_path, JSON.stringify(users, null, 2), 'utf8', err => {
        if (err)
            console.log(err)
    })
}