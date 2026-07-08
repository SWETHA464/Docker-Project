function BookIcon() {
  return (
    <svg viewBox="0 0 100 100" width="46" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 20 C14 16 17 14 21 14 L48 14 L48 82 L21 82 C17 82 14 80 14 76 Z"
        fill="#E3A857"
        stroke="#2B1B14"
        strokeWidth="2.5"
      />
      <path
        d="M86 20 C86 16 83 14 79 14 L52 14 L52 82 L79 82 C83 82 86 80 86 76 Z"
        fill="#F7EFE1"
        stroke="#2B1B14"
        strokeWidth="2.5"
      />
      <line x1="50" y1="14" x2="50" y2="82" stroke="#2B1B14" strokeWidth="2.5" />
      <line x1="21" y1="26" x2="42" y2="26" stroke="rgba(43,27,20,0.5)" strokeWidth="2" />
      <line x1="21" y1="34" x2="42" y2="34" stroke="rgba(43,27,20,0.5)" strokeWidth="2" />
      <line x1="58" y1="26" x2="79" y2="26" stroke="rgba(43,27,20,0.35)" strokeWidth="2" />
      <line x1="58" y1="34" x2="79" y2="34" stroke="rgba(43,27,20,0.35)" strokeWidth="2" />
      <line x1="58" y1="42" x2="74" y2="42" stroke="rgba(43,27,20,0.35)" strokeWidth="2" />
    </svg>
  );
}

export default function BookCard({ book, qtyInCart, onAdd, onRemove }) {
  return (
    <div className="book-card">
      <div className="book-thumb">
        {book.image_url ? (
          <img
            src={book.image_url}
            alt={book.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <BookIcon />
        )}
      </div>
      <div className="book-card-top">
        <div>
          <h3>{book.name}</h3>
          {book.author && <div className="book-author">by {book.author}</div>}
        </div>
        <span className={`tag ${book.category === "Fiction" ? "tag-fiction" : "tag-nonfiction"}`}>
          {book.category}
        </span>
      </div>
      <p className="book-desc">{book.description}</p>
      <div className="book-card-bottom">
        <span className="price">₹{Number(book.price).toFixed(0)}</span>
        {qtyInCart > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="qty-btn" onClick={() => onRemove(book)}>−</button>
            <strong>{qtyInCart}</strong>
            <button className="qty-btn" onClick={() => onAdd(book)}>+</button>
          </div>
        ) : (
          <button className="add-btn" onClick={() => onAdd(book)}>Add to cart</button>
        )}
      </div>
    </div>
  );
}
