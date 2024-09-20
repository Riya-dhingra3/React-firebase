import { useEffect, useState } from "react";
import "./App.css";
import { auth, db, storage } from "./config/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { ref,uploadBytes } from "firebase/storage";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [pages, setPages] = useState(0);
  const [updateName, setUpdateName] = useState("");
  const [user, setUser] = useState(null); // Track user authentication state
  const [loading, setLoading] = useState(true); // Track loading state for auth
  const [errorMessage, setErrorMessage] = useState(""); // Track errors

  // File upload state
  const [fileUpload,setfileUpload] = useState(null);

  const bookCollectionRef = collection(db, "Books");

  // Handle user authentication state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading when auth state is determined
    });
    
    return () => unsubscribeAuth(); // Cleanup on unmount
  }, []);

  const signIn = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created:", userCredential.user);
    } catch (error) {
      console.error("Error during sign-up:", error);
      setErrorMessage("Sign-up failed. Please try again.");
    }
  };

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);
      setErrorMessage(""); // Clear error message on successful login
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("Login failed. Please check your credentials.");
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  const deleteBook = async (id) => {
    try {
      await deleteDoc(doc(db, "Books", id));
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const updateBook = async (id) => {
    try {
      await updateDoc(doc(db, "Books", id), { Name: updateName });
      setUpdateName(""); // Clear the input field after update
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  const uploadFile= async() =>{
    if(fileUpload) return;
    const fileFolderref=ref(storage,`file/${fileUpload.name}`);
    try{
    await uploadBytes(fileFolderref,fileUpload);
    }
    catch(e){
      console.log(e);
    }
  }

  const handleSubmit = async () => {
    try {
      const userId = auth.currentUser ? auth.currentUser.uid : null; // Get the user ID (uid)
      
      if (!userId) {
        console.error("User is not signed in");
        return; // Exit if the user is not signed in
      }

      await addDoc(bookCollectionRef, { 
        Name: newBook, 
        Author: newAuthor, 
        noofpages: pages, 
        userId: userId // Use uid here
      });
      
      setNewBook("");
      setNewAuthor("");
      setPages(0);
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  // Fetch books only when the user is authenticated
  useEffect(() => {
    if (user) {
      const unsubscribeBooks = onSnapshot(bookCollectionRef, (snapshot) => {
        const filteredData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setBooks(filteredData);
      }, (error) => {
        console.error("Error fetching data:", error);
      });

      return () => unsubscribeBooks(); // Cleanup on unmount
    }
  }, [user]); // Only run when user is authenticated

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  return (
    <div className="App">
      <input
        type="email"
        placeholder="Email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <button onClick={signIn}>Sign Up</button>
      <button onClick={login}>Login</button>
      <button onClick={handleSignOut}>Sign Out</button> {/* Call renamed handleSignOut */}
      
      {/* Show error messages if any */}
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      
      {/* Conditionally render the book input and data based on user authentication */}
      {user ? (
        <>
          <div>
            <input
              placeholder="Book name..."
              value={newBook}
              onChange={(e) => setNewBook(e.target.value)}
            />
            <input
              placeholder="Author..."
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
            />
            <input
              placeholder="Number of pages..."
              type="number"
              value={pages}
              onChange={(e) => setPages(Number(e.target.value))}
            />
            <button onClick={handleSubmit}>Submit the book</button>
          </div>
          <div>
            {books.map((book) => (
              <div key={book.id}>
                <h1>{book.Name}</h1>
                <p>{book.Author}</p>
                <p>{book.noofpages}</p>
                <button onClick={() => deleteBook(book.id)}>Delete</button>
                <input
                  placeholder="New Name"
                  value={updateName}
                  onChange={(e) => setUpdateName(e.target.value)}
                />
                <button onClick={() => updateBook(book.id)}>Update</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>Please sign in to view and manage your books.</div>
      )}

      <div>
        <input type="file" onChange={(e)=>setfileUpload(e.target.files)}></input>
          <button onClick={uploadFile}>Upload file</button>
      </div>
    </div>
  );
}

export default App;
