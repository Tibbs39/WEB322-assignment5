/*****************************************************************************
*  WEB322 – Assignment 4
*  I declare that this assignment is my own work in accordance with Seneca 
*  Academic Policy. No part of this assignment has been copied manually or 
*  electronically from any other source (including web sites) or distributed 
*  to other students. 
*  
*  Name:         Kenneth Yue 
*  Student ID:   1227932176 
*  Date:         November 24, 2018 
* 
*  Online (Heroku) URL: https://serene-sands-79834.herokuapp.com/
* 
*****************************************************************************/  

const service = require('./data-service.js')
const express = require("express");
const app = express();
const path = require("path");
const fs = require('fs');
const multer = require("multer");
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');

const HTTP_PORT = process.env.PORT || 8080;

// for css
app.use(express.static('public'));

// body parsing
app.use(bodyParser.urlencoded({extended: true}));

// defining storage
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        // write the filename as the current date down to the millisecond
        cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });

// set up engine for handlebars
app.engine('.hbs', exphbs({ 
    extname: '.hbs', 
    defaultLayout: 'main',
    helpers: {
        // helper function for changing the navbar
        navLink: function(url, options) {
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    } 
}));
app.set('view engine', '.hbs');

// add middleware for the helper function
app.use(function(req,res,next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

// setting up default route
app.get("/", function(req,res) {
    res.render('home');
});

// setting up route for /about
app.get("/about", function(req,res) {
    res.render('about');
});

// route for /employees
app.get("/employees", function(req,res) {
    // if /employees?status
    if (req.query.status) {
        service.getEmployeesByStatus(req.query.status)
        .then((value) => res.render('employees', {employees: value}))
        .catch((err) => res.render('employees', {message: err}));
    // /employees?department   
    } else if (req.query.department) {
        service.getEmployeesByDepartment(req.query.department)
        .then((value) => res.render('employees', {employees: value}))
        .catch((err) => res.render('employees', {message: err}));
    // /employees?manager
    } else if (req.query.manager) {
        service.getEmployeesByManager(req.query.manager)
        .then((value) => res.render('employees', {employees: value}))
        .catch((err) => res.render('employees', {message: err}));
    } else {
        // getAllEmployees if invalid query
        service.getAllEmployees()
        .then((value) => res.render('employees', {employees: value}))
        .catch((err) => res.render('employees', {message: err}));
    }
});

// setting up route for /employees/add
app.get("/employees/add", function(req,res) {
    service.getDepartments()
    .then((value) => res.render('addEmployee', {departments: value}))
    .catch((err) => res.render('addEmployee', {message: err}));
});

app.post("/employees/add", function(req,res) {
    service.addEmployee(req.body).then(res.redirect('/employees'));
});

// route for /employee/:employeeNum
app.get("/employee/:employeeNum", function(req,res) {
    // parse if employeeNum is a number
    if (isNaN(req.params.employeeNum)) {
        // redirect if number is invalid
        res.redirect("/employees");    
    } else {

        let data = {};

        service.getEmployeesByNum(req.params.employeeNum)
        .then(function(value) {
            if (value) { 
                data.employee = value;
                service.getDepartments().then(function(value) {
                    data.departments = value;
                    for (let i = 0; i < data.departments.length; ++i) {
                        if (data.departments[i].departmentId == data.employee.department) {
                            data.departments[i].selected = true;
                            break;
                        }
                    }
                }).catch(() => { data.departments = []; })
                .then(() => { res.render('employee', { data: data }); });
            }
        })
        .catch(function(err) {
            res.status(404).render('employee', {message: "404: " + err});
        });
    }
});

// updating employees
app.post("/employee/update", (req, res) => {
    service.updateEmployee(req.body)
    .then(() => res.redirect("/employees"))
    .catch((err) => { res.status(500).render('employee', {message: "500: " + err}); });
});

app.get("/employees/delete/:empNum", function(req,res) {
    service.deleteEmployeeByNum(req.params.empNum)
    .then(() => res.redirect("/employees"))
    .catch(() => { res.status(500).render('employee', {message: "500: Unable to Delete Employee"}); });
});

// route for /departments
app.get("/departments", function(req,res) {
    service.getDepartments()
    .then(function(value) {
        console.log(value);
        res.render('departments', {departments: value});
    })
    .catch(function(err) {
        res.render('departments', {message: err});
    });
});

// route for /departments
app.get("/departments/add", function(req,res) {
    res.render('addDepartment');
});

app.post("/departments/add", function(req,res) {
    service.addDepartment(req.body).then(res.redirect('/departments'));
});

app.post("/department/update", function(req,res) {
    service.updateDepartment(req.body).then(res.redirect('/departments'));
});

app.get("/department/:departmentId", function(req,res) {
    service.getDepartmentById(req.params.departmentId)
    .then(function(value) {
        res.render('department', {department: value});
    })
    .catch(function(err) {
        res.status(404).render('department', {message: "404: " + err});
    });
});

app.get("/departments/delete/:departmentId", function(req,res) {
    service.deleteDepartmentById(req.params.departmentId)
    .then(function() {
        res.redirect("/departments");
    })
    .catch(function(err) {
        res.status(500).render('department', {message: err});
    });
})

// setting up route for /images/add
app.get("/images/add", function(req,res) {
    res.render('addImage');
});

app.post("/images/add", upload.single("imageFile"), function(req, res) {
    res.redirect('/images');
});

// route for /images
app.get("/images", function(req,res) {
    // read directory
    fs.readdir(path.join(__dirname,"/public/images/uploaded"), 
    function(err, items) {
            res.render('images', {images: items});
    });
});

// 404 message
app.use(function(req,res,next) {
    res.status(404).render('fourohfour');
});

// setup listen
service.initialize()
.then(function(msg) {
    console.log(msg);
    app.listen(HTTP_PORT);
})
.catch(function(err) {
    console.log(err);
});