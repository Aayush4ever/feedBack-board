// Firebase Config (Replace with your details)
const firebaseConfig = {
    apiKey: "AIzaSyDaQuFa5uyMcFTGmi6OWufpCwSe2QCKXBE",
    authDomain: "feedbackboard-d4a29.firebaseapp.com",
    projectId: "feedbackboard-d4a29",
    storageBucket: "feedbackboard-d4a29.firebasestorage.app",
    messagingSenderId: "353833850297",
    appId: "1:353833850297:web:992175d30535ecb0195268"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database().ref("feedbacks");
  
  function ThemeToggle({ toggleTheme, currentTheme }) {
    return (
      <button onClick={toggleTheme}>
        Switch to {currentTheme === "light" ? "Dark" : "Light"} Mode
      </button>
    );
  }
  
  function FeedbackForm({ onFeedbackAdded }) {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [comment, setComment] = React.useState("");
    const [msg, setMsg] = React.useState("");
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name || !email || !comment) {
        setMsg("All fields are required.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setMsg("Invalid email format.");
        return;
      }
  
      const newFeedback = {
        name,
        email,
        comment,
        timestamp: new Date().toISOString()
      };
  
      db.push(newFeedback).then(() => {
        setName("");
        setEmail("");
        setComment("");
        setMsg("Feedback submitted successfully!");
        onFeedbackAdded();
        setTimeout(() => setMsg(""), 3000);
      });
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <h2>Submit Feedback</h2>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <textarea placeholder="Comment" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
        <button type="submit">Submit</button>
        <p>{msg}</p>
      </form>
    );
  }
  
  function FeedbackItem({ feedback, id, onDelete }) {
    return (
      <div className="card">
        <h3>{feedback.name}</h3>
        <p>{feedback.comment}</p>
        <small>{feedback.email}</small><br />
        <button onClick={() => onDelete(id)}>Delete</button>
      </div>
    );
  }
  
  function FeedbackList() {
    const [feedbacks, setFeedbacks] = React.useState([]);
  
    const fetchFeedbacks = () => {
      db.once("value", (snapshot) => {
        const data = snapshot.val();
        const loaded = [];
        for (let id in data) {
          loaded.push({ id, ...data[id] });
        }
        setFeedbacks(loaded.reverse());
      });
    };
  
    React.useEffect(() => {
      fetchFeedbacks();
    }, []);
  
    const deleteFeedback = (id) => {
      firebase.database().ref("feedbacks/" + id).remove().then(() => {
        fetchFeedbacks();
      });
    };
  
    return (
      <div className="feedback-list">
        <h2>All Feedbacks</h2>
        {feedbacks.map((fb) => (
          <FeedbackItem key={fb.id} feedback={fb} id={fb.id} onDelete={deleteFeedback} />
        ))}
      </div>
    );
  }
  
  function App() {
    const [theme, setTheme] = React.useState(localStorage.getItem("theme") || "light");
  
    React.useEffect(() => {
      document.body.className = theme;
      localStorage.setItem("theme", theme);
    }, [theme]);
  
    const toggleTheme = () => {
      setTheme(theme === "light" ? "dark" : "light");
    };
  
    const refreshFeedbacks = () => {
      // Will be passed to child to refetch
    };
  
    return (
      <div className="container">
        <ThemeToggle toggleTheme={toggleTheme} currentTheme={theme} />
        <FeedbackForm onFeedbackAdded={refreshFeedbacks} />
        <FeedbackList />
      </div>
    );
  }
  
  ReactDOM.render(<App />, document.getElementById("root"));