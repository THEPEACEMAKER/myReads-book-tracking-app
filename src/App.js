import React from 'react'
// import * as BooksAPI from './BooksAPI'
import './App.css'
import { Link } from 'react-router-dom'
import { Route } from 'react-router-dom'
import * as BooksAPI from "./BooksAPI"

class BooksApp extends React.Component {
  state = {
    books : []
  }

  componentDidMount() {
    BooksAPI.getAll().then((books) => {
      this.setState({ books })
    })
  }

  shelves = [
    {key:'currentlyReading' , name: 'Currently Reading'},
    {key:'wantToRead' , name: 'Want to Read'},
    {key:'read' , name: 'Read'},
  ]

  ChangeShelf = (book, shelf) => {
    BooksAPI.update(book, shelf).then(books => {
      const updatedBooks = this.state.books.map(c => {
        if (c.id === book.id) {
          c.shelf = shelf
        }
        return c
      });

      this.setState({
        books: updatedBooks,
      });
    });
  }

  render() {
    const { books } = this.state;

    return (
      <div className="app">
        <Route path='/search' component={SearchBooks}  />

        <Route exact path='/'
        render={() => (
          <ListBooks books={books} shelves={this.shelves} onChangeShelf={this.ChangeShelf} />
        )}
        />
      </div>
    )
  }
}

class ListBooks extends React.Component {
  render() {
    const { books, shelves, onChangeShelf } = this.props;

    // filter books for a particular shelf
    function booksOnShelf (shelf){
      return books.filter(book => book.shelf === shelf.key)
    }

    return (
      <div className="list-books">
        <div className="list-books-title">
          <h1>MyReads</h1>
        </div>
        <div className="list-books-content">
          <div>
            {shelves.map(shelf => (
              <Bookshelf key={shelf.key} shelf={shelf} books={booksOnShelf(shelf)} onChangeShelf={onChangeShelf} />
            ))}
          </div>
        </div>
        <SearchPage />
      </div>
    )
  }
}

class Bookshelf extends React.Component {
  render() {
    const { shelf, books, onChangeShelf } = this.props;

    return (
      <div className="bookshelf">
        <h2 className="bookshelf-title">{shelf.name}</h2>
        <div className="bookshelf-books">
          <ol className="books-grid">
            {books.map(book => (
              <Book key={book.id} book={book} onChangeShelf={onChangeShelf} />
            ))}
          </ol>
        </div>
      </div>
    )
  }
}

class Book extends React.Component {
  render() {
    const { book, onChangeShelf } = this.props;

    return (
      <li>
          <div className="book">
            <div className="book-top">
              <div className="book-cover" style={{ width: 128, height: 193, backgroundImage: `url(${book.imageLinks &&
                book.imageLinks.thumbnail})` }}></div>
              <BookControl book={book} onChangeShelf={onChangeShelf} />
            </div>
            <div className="book-title">{book.title}</div>
            <div className="book-authors">{book.authors && book.authors.join(', ')}</div>
          </div>
      </li>
    )
  }
}

class BookControl extends React.Component {
  state = {
    value: this.props.book.shelf,
  }
  handleChange = event => {
    this.setState({ value: event.target.value });
    this.props.onChangeShelf(this.props.book, event.target.value);
  }
  render() {
    return (
      <div className="book-shelf-changer">
        <select value={this.state.value} onChange={this.handleChange} >
          <option value="move" disabled>Move to...</option>
          <option value="currentlyReading">Currently Reading</option>
          <option value="wantToRead">Want to Read</option>
          <option value="read">Read</option>
          <option value="none">None</option>
        </select>
      </div>
    )
  }
}

function SearchPage(){
  return (
    <div className="open-search">
      <Link to="/search"><button>Add a book</button></Link>
    </div>
  )
}

class SearchBooks extends React.Component {
  state = {
    searchResults : [],
    value: ''
  }

  handleChange = event => {
    const value = event.target.value;
    this.setState({ value: value });

    if (value.length > 0) {
      BooksAPI.search(value).then(books => {
        if (books.error) {
          this.setState({ searchResults: [] });
        } else {
          this.setState({ searchResults: books });
        }
      }).catch(this.setState({ searchResults: [] }));
    }else {
      this.setState({ searchResults: [] });
    }
  };

  resetSearch = () => {
    this.setState({ searchResults: [] });
  }

  render() {
    return (
      <div className="search-books">
        <div className="search-books-bar">
          <HomePage resetSearch={this.resetSearch} />
          <div className="search-books-input-wrapper">
            {/*
              NOTES: The search from BooksAPI is limited to a particular set of search terms.
              You can find these search terms here:
              https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

              However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
              you don't find a specific author or title. Every search is limited by search terms.
            */}
            <input type="text" placeholder="Search by title or author" value={this.state.value} onChange={this.handleChange} />

          </div>
        </div>
        <div className="search-books-results">
          <ol className="books-grid">
          {this.state.searchResults.map(book => (
              <Book key={book.id} book={book} />
            ))}
          </ol>
        </div>
      </div>
    )
  }
}

function HomePage(props){
  return (
    <Link to="/"><button className="close-search" onClick={props.resetSearch} >Close</button></Link>
  )
}

export default BooksApp
