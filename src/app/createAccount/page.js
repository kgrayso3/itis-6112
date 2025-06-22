'use client'
import {db} from '../firebaseConfig'
import {collection, addDoc} from 'firebase/firestore'
import React, {useState} from 'react';
async function addUserToFirestore(name, email) {
    try{
        const docRef = await addDoc(collection(db, "users"),{
            name: name,
            email: email,
        });
        console.log ("User added");
        return true;

    }catch(error){
    console.error("Error adding user", error)
    return false;
    }
}

export default function CreateAccount(){
    const [name, setName] = useState("");
    const [email, setEmail]= useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const added = await addUserToFirestore(name, email);
        if(added){
            setName("");
            setEmail("");

            alert ("User added successfully")
        }
    };
    return(
        <main>
            <h1>
                Create an Account
            </h1>
            <form onSubmit={handleSubmit} >
                <div>
                    <label>
                        Name:
                    </label>
                    <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label>
                        Email:
                    </label>
                    <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <button type='submit'>
                        Submit
                    </button>
                </div>
            </form>
        </main>
    )
}