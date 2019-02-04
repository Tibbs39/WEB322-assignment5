# WEB322 - Assignment 6

This webapp was uploaded to heroku and can be viewed here: [https://young-mesa-30101.herokuapp.com/](https://young-mesa-30101.herokuapp.com/)

In this assignment attached a database to our app, using sequelize.js and PostgreSQL. 
All queries make calls to the tables in PostgreSQL to make any CRUD operations.
In addition, a MongoDB database was attached for users accounts. You can must create an account and login in order to view the employees. 
Alternatively you can login with the following to view the app.

Username: test

Password: 123

The following queries are available:
```
/employees?status
```
This returns a list of employees filtered by status, either "Full Time" or "Part Time". For example `/employees?status=Full Time` returns a list of employees that have "Full Time" status

```
/employees?department
```
This returns a list of employees filtered by department. For example `/employees?department=1` returns a list of employees that are in department 1.


```
/employees?manager
```
This returns a list of employees filtered by their manager number. For example `/employees?manager=1` returns a list of employees who's manager's employee number is 1.


```
/employee/:num
```
This returns the result of searching for an employee by their employee number. For example `/employee/2` will return employee number 2.
This page allows you to edit and update the employee's information.

*Please note that these queries cannot be chained together.*

*My intention with uploading school assignments on GitHub is merely to build a portfolio of my work.* **_Please do not plagiarize._**
