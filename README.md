# 1. User Registration
http
Copy code
POST https://library-management-system-backend-2zvl.onrender.com/user_registration
Content-Type: application/json
Payload:

json
Copy code
{
    "id": "450e8400-e29b-41d4-a716-446655440002",
    "name": "Anjali",
    "email": "anjali@gmail.com",
    "password": "Anjali@1234",
    "role": "User"
}
# 2. User Login
http
Copy code
POST https://library-management-system-backend-2zvl.onrender.com/user_login
Content-Type: application/json
Payload:

json
Copy code
{
    "email": "anjali@gmail.com",
    "password": "Anjali@1234"
}
# 3. Fetch User Profile
http
Copy code
GET https://library-management-system-backend-2zvl.onrender.com/user_profile
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

# 4. Fetch Books
http
Copy code
GET https://library-management-system-backend-2zvl.onrender.com/books
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
# 5. Book Borrow Request
http
Copy code
POST https://library-management-system-backend-2zvl.onrender.com/book_borrow_request_from_user/1e361428-8a48-463b-bca3-57215382c6fd?status=book%20request
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
* book_id is give as Route parameters(1e361428-8a48-463b-bca3-57215382c6fd)
* status is give as Query parameters(status=book%20request)
# 6. View Borrow Requests (Librarian)
http
Copy code
GET https://library-management-system-backend-2zvl.onrender.com/view_all_book_borrow_request_by_librarian
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
# 7. Approve/Deny Borrow Request
http
Copy code
PUT https://library-management-system-backend-2zvl.onrender.com/approve_deny_borrow_request/b7f07669-e5a5-4622-b47a-15347f9db7c7?status=Approve
* borrow book id  is give as Route parameter(b7f07669-e5a5-4622-b47a-15347f9db7c7)
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

# 7 Table
* book 
* book_borrow_request  
* user
# 8 Table schema
# (a) book
0|id|TEXT|1||1
1|book_name|TEXT|1||0
2|author_name|TEXT|1||0
3|quantity|INTEGER|1||0
* In book table id TEXT it is store UUIDv4() not null primary key, author_name and book_name are TEXT while quantity is a INTEGER
* Output look like: a28fbd62-993b-4903-8253-0a4b2cfd7f3e|Jane Eyre|Charlotte Bronte|9

# (b) book_borrow_request
0|id|TEXT|1||1
1|user_id|TEXT|0||0
2|book_id|TEXT|0||0
3|book_borrowed_start_date|DATE|0||0
4|book_submit_end_date|DATE|0||0
5|user_borrow_book_request_date|DATE|0||0
6|status|VARCHAR(20)|0||0
7|librarian_id|TEXT|0||0
* In book_borrow_request table user_id, librarian_id and book_id are the Foregin key of user, user and  book table while book_borrowed_start_date represent the date when user borrowed a book after "APPROVAL" through Librarian to last date of submission which represent the column book_submit_end_date.
* user_borrow_book_request_date column store the date when user request for borrow the book
* status is "book request", "Approve", "Deny"
* "book request" send through User while "Approve", "Deny" is completely depend of Librarian for book request
* librarian_id = it is store the id of Librarian to ensure that which Librarian "Approve", "Deny" the book borrow request of user
* Each borrowed book have 7 days from book_borrowed_start_date to book_submit_end_date
* Output look like: b7f07669-e5a5-4622-b47a-15347f9db7c7|550e8400-e29b-41d4-a716-446655440000|1e361428-8a48-463b-bca3-57215382c6fd|2024-12-10|2024-12-17|2024-12-09|Approve|150e8400-e29b-41d4-a716-446655440001

# (c) user
0|id|TEXT|1||1
1|name|VARCHAR(255)|1||0
2|email|TEXT|1||0
3|password|TEXT|1||0
4|role|VARCAHR(20)|1||0
5|created_at|TIMESTAMP|0|CURRENT_TIMESTAMP|0
* In role column it store eigther "User" or "Librarian" 
* All table id columns are the primary key as Text which store the id as UUIDv4() 
* Output look like: 550e8400-e29b-41d4-a716-446655440000|Arun|arun@gmail.com|$2b$10$FYZuItW8516o3pfNpXvW4uxH/aEF6Cbv1tSWPOFbr1YezegPDGO2C|User|2024-12-09 10:14:14
