const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const {
  checkUserRegisteredData,
  checkUserLoginData,
} = require("./checkUserData");
const { date, extendDate } = require("./date");
const server_instance = express();
const dbPath = path.join(__dirname, "library_management_system.db");
let dataBase = null;

server_instance.use(cors());
server_instance.use(express.json());

const initialize_DataBase_and_Server = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    server_instance.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

initialize_DataBase_and_Server();

// Token Authorization (Middleware Function)
const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
    if (!jwtToken) {
      response.status(401).send("Unauthorized Access Token");
    } else {
      jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
        if (error) {
          response.status(403).send("Invalid Token");
        } else {
          request.email = payload.email;
          next();
        }
      });
    }
  } else {
    response.status(401).send("Authorization header missing");
  }
};

// User Registration
server_instance.post("/user_registration", async (request, response) => {
  const { id, name, email, password, role } = request.body;
  const checkUserNameEmail = {
    name: name,
    email: email,
    password: password,
    role: role,
    id: id,
  };
  const hashPassword = await bcrypt.hash(password, 10);
  try {
    if (!id || !name || !email || !password || !role) {
      console.log(
        "User all details are mandatory to give such as 'id', 'name', 'email', 'password' and 'role' in valid format."
      );

      response
        .status(400)
        .send(
          "User all details are mandatory to give such as id, name, email, password and role"
        );
    } else {
      const { error } = checkUserRegisteredData.validate(checkUserNameEmail);
      if (error) {
        console.log(`User Registration Error: ${error.details[0].message}`);
        response
          .status(400)
          .send(`User Registration Error: ${error.details[0].message}`);
      } else {
        const isUserExistQuery = `SELECT * FROM user WHERE email = ?`;
        const dbUser = await dataBase.get(isUserExistQuery, [email]);
        if (!dbUser) {
          const userRegistrationQuery = `INSERT INTO user(id, name, email, password, role) VALUES (?,?,?,?,?);`;
          await dataBase.run(userRegistrationQuery, [
            id,
            name,
            email,
            hashPassword,
            role,
          ]);
          response
            .status(200)
            .send(`Email address: ${email} as a ${role} created successfully`);
          console.log(
            `Email address: ${email} as a ${role} created successfully`
          );
        } else {
          response.status(400).send(`User ${email} is already exist`);
          console.log("User ${email} is already exist");
        }
      }
    }
  } catch (error) {
    response.status(500).send(`Error Message: ${error.message}`);
  }
});

// Login User
server_instance.post("/user_login", async (request, response) => {
  const { email, password } = request.body;
  const checkLoginData = { email: email, password: password };

  try {
    if (!email || !password) {
      response
        .status(400)
        .send(
          "User correct email and password both are mandatory to give for login..!"
        );
    } else {
      const { error } = checkUserLoginData.validate(checkLoginData);
      if (error) {
        console.log(`User Login Error: ${error.details[0].message}`);
        response
          .status(400)
          .send(`User Login Error: ${error.details[0].message}`);
      } else {
        const checkUserExistQuery = `SELECT * FROM user WHERE email = ?`;
        const checkUserExist = await dataBase.get(checkUserExistQuery, [email]);
        if (!checkUserExist) {
          response
            .status(400)
            .send(
              "Invalid user email address does not exist kindly create a account !"
            );
        } else {
          const isPasswordMatch = await bcrypt.compare(
            password,
            checkUserExist.password
          );
          if (isPasswordMatch) {
            const payload = { email: email };
            const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
            const tokenDetail = { jwt_token: jwtToken };
            response.status(200).send(tokenDetail);
            console.log(tokenDetail);
          } else {
            response.status(400).send("Invalid login password");
          }
        }
      }
    }
  } catch (error) {
    response.status(500).send(`Error while Login: ${error.message}`);
    console.log(`Error while Login: ${error.message}`);
  }
});

// User Profile
server_instance.get(
  "/user_profile",
  authenticateToken,
  async (request, response) => {
    const { email } = request;
    try {
      const retrieveUserDetailQuery = `SELECT * FROM user WHERE email = ?`;
      const retrieveUserDetail = await dataBase.get(retrieveUserDetailQuery, [
        email,
      ]);
      response.status(200).send({
        user_profile_detail: [
          {
            name: retrieveUserDetail.name,
            email_id: retrieveUserDetail.email,
            role: retrieveUserDetail.role,
          },
        ],
      });
    } catch (error) {
      console.log(`${error.message}`);
      response.status(400).send(`${error.message}`);
    }
  }
);

// Get all books details
server_instance.get("/books", authenticateToken, async (request, response) => {
  try {
    const getBookDetailsQuery = `SELECT * FROM book`;
    const getAllBookDetails = await dataBase.all(getBookDetailsQuery);
    response.status(200).send(getAllBookDetails);
  } catch (error) {
    console.log(`${error.message}`);
    response
      .status(500)
      .send(`Error while getting all book details: ${error.message}`);
  }
});

// User Borrow Book Request
server_instance.post(
  "/book_borrow_request_from_user/:bookId",
  authenticateToken,
  async (request, response) => {
    const { bookId } = request.params;
    const { email } = request;
    const { status } = request.query;
    try {
      const retrieveUserDetailQuery = `SELECT * FROM user WHERE email = ?`;
      const retrieveUserDetail = await dataBase.get(retrieveUserDetailQuery, [
        email,
      ]);

      if (retrieveUserDetail.role === "User") {
        if (status === "book request") {
          const checkUserBookReqQuery = `SELECT * FROM book_borrow_request WHERE book_id = ? AND ? >= book_borrowed_start_date AND ? <= book_submit_end_date AND status = ?`;
          const checkUserBookReq = await dataBase.get(checkUserBookReqQuery, [
            bookId,
            date(),
            date(),
            "Approve",
          ]);
          if (checkUserBookReq) {
            const getUserNameQuery = `SELECT * FROM user WHERE id = ?`;
            const getUserName = await dataBase.get(getUserNameQuery, [
              checkUserBookReq.user_id,
            ]);
            const bookNameQuery = `SELECT * FROM book WHERE id = ?`;
            const bookName = await dataBase.get(bookNameQuery, [bookId]);
            response
              .status(400)
              .send(
                `The ${bookName.book_name} book is already borrowed to the user ${getUserName.name} from  ${checkUserBookReq.book_borrowed_start_date} to ${checkUserBookReq.book_submit_end_date}. You can apply for this book ${bookName.book_name} after ${checkUserBookReq.book_submit_end_date}..!`
              );
          } else {
            const userBookBorrowRequestQuery = `INSERT INTO book_borrow_request(id, user_id, book_id, user_borrow_book_request_date, status) VALUES (?,?,?,?,?)`;
            const userBookBorrowRequest = await dataBase.run(
              userBookBorrowRequestQuery,
              [uuidv4(), retrieveUserDetail.id, bookId, date(), status]
            );
            const bookNameQuery = `SELECT * FROM book WHERE id = ?`;
            const bookName = await dataBase.get(bookNameQuery, [bookId]);
            response
              .status(200)
              .send(
                `Your book borrow request is accepted book name ${bookName.book_name}.Now it is pending state kindly wait for 'Approved' by the admin of librarian..! `
              );
          }
        }
      }
    } catch (error) {
      response.status(500).send(`${error.message}`);
    }
  }
);

// View all book borrow requests by Librarian .

server_instance.get(
  "/view_all_book_borrow_request_by_librarian",
  authenticateToken,
  async (request, response) => {
    const { email } = request;

    try {
      const checkLibrarianQuery = `SELECT * FROM user WHERE email = ?`;
      const checkLibrarian = await dataBase.get(checkLibrarianQuery, [email]);
      if (checkLibrarian.role === "User") {
        response
          .status(400)
          .send(
            "This route is only accessible for admin as librarian not for user..!"
          );
      } else {
        const combinedQuery = `SELECT book_borrow_request.id AS book_borrow_request_id, 
        user.name AS user_name, user.email, book.book_name, book.author_name FROM book_borrow_request 
        INNER JOIN user ON book_borrow_request.user_id = user.id INNER JOIN book ON book_borrow_request.book_id = book.id WHERE 
        book_borrow_request.status = ?`;

        const bookRequests = await dataBase.all(combinedQuery, [
          "book request",
        ]);
        response.status(200).send(bookRequests);
      }
    } catch (error) {
      response.status(500).send(`${error.message}`);
    }
  }
);

// Approve or deny a borrow request.
server_instance.put(
  "/approve_deny_borrow_request/:bookBorrowId",
  authenticateToken,
  async (request, response) => {
    const { email } = request;
    const { bookBorrowId } = request.params;
    const { status } = request.query;

    try {
      const checkLibrarianQuery = `SELECT * FROM user WHERE email = ?`;
      const checkLibrarian = await dataBase.get(checkLibrarianQuery, [email]);

      if (checkLibrarian.role === "User") {
        return response
          .status(400)
          .send(
            "This route is only accessible for admin as librarian, not for user!"
          );
      } else {
        const bookBorrowIdQuery = `SELECT * FROM book_borrow_request WHERE id = ?`;
        const bookBorrow = await dataBase.get(bookBorrowIdQuery, [
          bookBorrowId,
        ]);

        if (!bookBorrow) {
          return response.status(404).send("Borrow request not found!");
        }

        const updateBookBorrowQuery = `
          UPDATE book_borrow_request 
          SET status = ?, book_borrowed_start_date = ?, book_submit_end_date = ?, librarian_id = ?
          WHERE id = ?
        `;

        await dataBase.run(updateBookBorrowQuery, [
          status,
          date(),
          extendDate(),
          checkLibrarian.id,
          bookBorrow.id,
        ]);

        response
          .status(200)
          .send("User borrow book request updated successfully.");
      }
    } catch (error) {
      response.status(500).send(`Error: ${error.message}`);
    }
  }
);
