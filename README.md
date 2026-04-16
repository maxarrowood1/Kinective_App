# Kinective
# Back-End Developer Skills Assessment

## Introduction

We're excited that you want to be a part of Kinective. We want to ensure that we're hiring only the brightest and best talent in the market and ensure that we're a good fit for each other when it comes to the employment relationship. This skills assessment is used as an additional tool to evaluate your current skill set and to identify potential areas where we can harness and increase those skills.

We look forward to reviewing your results and helping you achieve an amazing future with Kinective.

---

## Requirements

This project requires you to create & design a simple address book application. Meet the following requirements:

- **GUI creation is preferred (but optional)** - Consider using modern frontend frameworks like Vue, React, or Angular that can consume your API
- **Use a database of your choice** (PostgreSQL, MySQL, MongoDB, Redis, H2, or any database you're comfortable with)
- **Clearly show the Model-View-Controller (MVC) or similar architectural pattern** in your code
- **Be able to demonstrate your Address Book Application supports C.R.U.D.** to our Kinective team
  - Create a new contact in the database
  - Read the contact
  - Update the contact
  - Delete the contact
- **Add two additional functionalities on top of C.R.U.D.** These could range from:
  - Search/filtering contacts
  - Pagination
  - User authentication/authorization
  - Contact groups/categories
  - Import/export functionality
  - Contact validation
  - Logging and audit trails
- **Use proper data validation**
- **Any coding language/framework can be used for the frontend** (if implementing a GUI)

---

## Skills Evaluated

### Communication (2pts)
We strongly believe communication is one of the cornerstones of success! We will evaluate you on your ability to communicate your:
- Database structure and design decisions
- API architecture and endpoint design
- Ability to handle any questions related to your code
- Code documentation and README clarity

If you need any further clarification on our expectations, directions, vocabulary, or resources you could refer to, please let us know.

### Design (2pts)
We will evaluate your:
- API design skills and RESTful principles
- Code architecture and design patterns
- Database schema design
- If implementing a GUI: UI/UX design skills and ability to adapt to the latest trends in web applications
- Give us a peek of your personality and design style!

### Organization (2pts)
Working in a team means your code is viewed by many people. That is why we need:
- Code to be as comfortable to read as possible
- Files organized exactly where they need to be
- Proper coding conventions and idiomatic usage for your chosen language/framework
- Clear project structure following industry best practices
- Meaningful naming conventions

### Requirements (9pts)
We will evaluate if the app meets the requirements mentioned above using C.R.U.D.:
- **Create** a new contact in the database (2pts)
- **Read** the contact (2pts)
- **Update** the contact (2pts)
- **Delete** the contact (2pts)
- **Proper data input validation** (1pt)

Show us you know your C.R.U.D. and demonstrate proper error handling and API responses.

### Optional Challenge - Design Document & Activity Flow Diagram (5pts)
Create documentation that includes:
- Activity/Flow diagram showing current design
- Future enhancements that would be needed to make the application design fool-proof
- API documentation (consider using OpenAPI/Swagger)
- Architecture diagram showing how components interact

We will evaluate:
- Approach to design
- Future readiness and scalability considerations
- Edge case handling
- How this design and data flow has been transferred to the code

---

## Technical Recommendations

**Note:** While any programming language and framework can be used for this assessment, we strongly prefer **Kotlin with the KTOR framework**. The recommendations below focus on Kotlin/KTOR, but feel free to use equivalent patterns and best practices in your chosen technology stack.

### If Using Kotlin & KTOR (Preferred):
- Utilize KTOR's routing DSL for clean API endpoint definition
- Implement proper content negotiation (JSON serialization with kotlinx.serialization, jackson, or equivalent)
- Use KTOR's features/plugins for authentication, CORS, status pages, etc.
- Consider using Exposed or other Kotlin-friendly ORM for database operations
- Use coroutines and suspend functions appropriately
- Leverage Kotlin's null safety features
- Use data classes for models
- Utilize Kotlin's extension functions where appropriate
- Implement proper scope functions (let, apply, run, etc.)

### General Best Practices (All Technologies):
- Follow RESTful principles for API design
- Use appropriate HTTP methods (GET, POST, PUT/PATCH, DELETE)
- Return proper HTTP status codes
- Implement consistent error responses
- Consider API versioning
- Write clean, readable, and well-organized code
- Use proper separation of concerns and architectural patterns
- Implement comprehensive error handling and validation

---

## Submission Guidelines

Please provide:
1. **Source code** - Hosted on GitHub, GitLab, or similar platform
2. **README.md** - Including:
   - Setup instructions
   - How to run the application
   - API documentation or link to Postman collection
   - Any environment variables or configuration needed
   - Technology stack and dependencies used
3. **Database schema** or migration scripts
4. **(Optional)** Demo video or deployed application URL
5. **(Optional)** Design documents and diagrams

---

## Evaluation Timeline

We expect this assessment to take approximately **4-8 hours** to complete. Please submit your completed project within **7 days** of receiving this assessment.

---
