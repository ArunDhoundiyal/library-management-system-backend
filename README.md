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
# 6. View Borrow Requests (Librarian)
http
Copy code
GET https://library-management-system-backend-2zvl.onrender.com/view_all_book_borrow_request_by_librarian
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
7. Approve/Deny Borrow Request
http
Copy code
PUT https://library-management-system-backend-2zvl.onrender.com/approve_deny_borrow_request/b7f07669-e5a5-4622-b47a-15347f9db7c7?status=Approve
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

# 7 Table
* book 
* book_borrow_request  
* user
