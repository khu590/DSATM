//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const connection = require("./database");
const session = require('express-session');  
const { redirect } = require("express/lib/response");
const mysqlStore = require('express-mysql-session')(session);
// const bcrypt = require('bcrypt');

const app = express();

// const TWO_HOURS = 1000 * 60 * 60 * 2

// const{
//     NODE_ENV = 'development',

//     SESS_NAME = 'sid',
//     SESS_SECRET = 'secret_quote',
//     SESS_LIFETIME = TWO_HOURS
// } = process.env

// const IN_PROD = NODE_ENV === 'production'


// const options = {
//     connectionLimit: 10,
//     password: process.env.password,
//     user: process.env.user,
//     database: process.env.database,
//     host: process.env.host,
//     createDatabaseTable: false,
//     schema: {
//         tableName: 'admin',
//         columnNames: {
//             session_id: 'user_id',
//             expires: ''
//         }
//     }
// }

// const sessionStore = new mysqlStore(options);


// const saltRounds = 10;


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session ({
    secret: 'ssshhh',
    saveUninitialized: true,
    resave: true
}));
app.use(bodyParser.json());    


var sess;

    // cookie: {
    //     httpOnly: true,
    //     maxAge: SESS_LIFETIME,
    //     sameSite: true,
    //     secure: IN_PROD
    // }


// const redirectLogin = (req, res, next) => {
//     if(!req.session.userId) {
//         res.redirect('/adm_fac')
//     }else{
//         next()
//     }
// }






// This responds with "index page" on the homepage
app.get("/", function(req, res){

    res.render("index");
})

// app.get("/", function(req, res){
//     let sql = "select * from fac_login " ;
//     connection.query(sql, function(err, results){
//         if(err) throw err;
//         res.send(results)
//     });
// });



// ------admin page------

app.get("/admin" ,function(req, res){


    res.render("admin");
})

// This responds a POST request for the admin page---- 'username' & 'password' are the names given in admin.ejs file && 'user_name' & 'user_pass' are given in workbench
app.post("/admin", function(req, res){
    var post = req.body;
    var username = post.username;
    var password = post.password;
  
    connection.query("select * from admin where user_name = ? and user_pass = ?", [username, password], function(error,results,fields){
        if(results.length > 0) {
            
              res.redirect("/adm_fac");
            }else{
            //   res.redirect("/");
            res.send("Please enter log in credentials")
            }
            res.end(); 
        });
         
});

app.get("/logout", function(req, res){

    res.render("index");
})

app.post('/logout', (req, res)=>{
    req.session.destroy(err => {
        if(err){
            return res.redirect('/')
        }
        sessionStore.close()
        res.clearCookie(SESS_NAME)
        res.redirect('/admin')
    })
})






// ------faculty page------

app.get("/faculty", function(req, res){

 
        res.render("faculty");
   
 
})

app.post("/faculty", function(req, res){
    sess = req.session;
    var post = req.body; 
    var id = post.id;
    var pass = post.pass;
    sess.fac_id = id;

    connection.query("select * from faculty where fac_id = ? and password = ?", [id, pass], function(error,results,fields){
        if(results.length > 0) {
          
                    console.log(id);
                    id = sess.fac_id;
                    res.redirect("/NaacCriterion3");
                }else{
                    res.redirect("/");
                }
                res.end();
            });             
       
});





//when admin-login is succesful
app.get("/adm_fac", function(req, res){

    var sql2 = "SELECT count(*) as count from faculty";

    connection.query(sql2, function(err, results){
        if(err) throw err

        var count = results[0].count;  


        res.render("adm_fac", {count: count})
    })  

})




//when fac-login is succesful
app.get("/NaacCriterion3", function(req, res){

    sess = req.session;
    var post = req.body; 
    var id = post.id;
    var pass = post.pass;
    sess.fac_id = id;

    var sql1 = "SELECT faculty.fac_id, name, email, department, gender, phone, address, salary, designation from faculty where faculty.fac_id = fac_id";

    connection.query(sql1, function(err, rows, fields){
        if(err) throw err

        res.render("NaacCriterion3", {title: 'report', items: rows })
    })

})

app.get('/logout',function(req,res){    
    req.session.destroy(function(err){  
        if(err){  
            console.log(err);  
        }  
        else  
        {  
            res.redirect('/');  
        }  
    });  
});  


app.get("/report", function(req, res){
    res.render("report"); 
})

//sum of funds 
app.get("/report_grants", function(req, res){

    var sql3 = "SELECT sum(funds) as sum1 from grants";

    connection.query(sql3, function(err, results){
        if(err) throw err

        var sum1 = results[0].sum1;

        res.render("report_grants", {sum1: sum1})
    }) 

})

app.get("/grants_cse", function(req, res){

    var sql1 = "SELECT faculty.fac_id, department, name_project, name_pi, dept_pi, year_of_award, funds, DATEDIFF(date_to, date_from) AS date_diff, additional_info from faculty, grants where faculty.fac_id = grants.fac_id and department = 'cse' ";

    connection.query(sql1, function(err, rows, fields){
        if(err) throw err

        res.render("grants_cse", {title: 'report', items: rows })
    })  
  
})

app.get("/grants_ise", function(req, res){

    var sql2 = "SELECT faculty.fac_id, department, name_project, name_pi, dept_pi, year_of_award, funds, DATEDIFF(date_to, date_from) AS date_diff, additional_info from faculty, grants where faculty.fac_id = grants.fac_id and department = 'ise' ";

    connection.query(sql2, function(err, rows, fields){
        if(err) throw err

        res.render("grants_ise", {title: 'report', items: rows })
    })  
  
})

app.get("/report_rg", function(req, res){

    var sql1 = "SELECT faculty.fac_id, department, name_project, name_pi, dept_pi, year_of_award, funds, DATEDIFF(date_to, date_from) AS date_diff, additional_info from faculty, grants where faculty.fac_id = grants.fac_id and department = 'ise' ";

    connection.query(sql1, function(err, rows, fields){
        if(err) throw err

        res.render("report_rg", {title: 'report', items: rows })
    })  
  
})



// app.post("/report", function(req, res){

//     const item = new Item ({
//         var post = req.body;
//         var id = post.fac_id;
//         var name = post.name_project;
//     });

//     item.save(function(err){
//         if (!err){
//           res.redirect("/");
//         }
//       });

// })

app.get("/research", function(req, res){
    res.render("research");
})

app.get("/innovation", function(req, res){
    res.render("innovation");
})

app.get("/res_publication", function(req, res){
    res.render("res_publication");
})




// ------grants received page------

app.get("/grants_received", function(req, res){
    res.render("grants_received");
})

app.post("/grants_received", function(req, res){

    var sql = "insert into grants values ( '" + req.body.fac_id +"' , '"+ req.body.name_project +"' , '"+ req.body.name_pi +"', '"+ req.body.dept_pi +"' , '"+ req.body.year_of_award +"' , '"+ req.body.funds +"' , '"+ req.body.date_from +"' , '"+ req.body.date_to +"' , '"+ req.body.additional_info +"' ) ";
    connection.query(sql, function(err){
        if (err) throw err;
        res.render('grants_received')       

        res.end();
    })
});

app.get("/add_fac", function(req, res){
    res.render("add_fac");
})

app.post("/add_fac", function(req, res){

    var sql = "insert into faculty values ( '" + req.body.fac_id +"' , '"+ req.body.password +"' , '"+ req.body.name +"', '"+ req.body.gender +"' , '"+ req.body.department +"' , '"+ req.body.phone +"' , '"+ req.body.email +"' , '"+ req.body.dob +"' , '"+ req.body.designation +"' , '"+ req.body.experience +"' , '"+ req.body.qualification +"' , '"+ req.body.reporting_to +"' , '"+ req.body.area_of_specialization +"' , '"+ req.body.salary +"' , '"+ req.body.address +"' , '"+ req.body.aicte_id +"') ";
    connection.query(sql, function(err){
        if (err) throw err;
        res.render('add_fac')
        

        res.end();
    })
});

// app.post("/add_fac", function(req, res){

//     var post = req.body;
//     var fac_id = post.fac_id;

//     connection.query ("Insert into faculty where fac_id = ?", [fac_id], function(error,results,fields){
        
//         res.render('add_fac');

//     });

//     // var sql = "insert into faculty values ( '" + req.body.fac_id +"' , '"+ req.body.password +"' , '"+ req.body.name +"', '"+ req.body.gender +"' , '"+ req.body.department +"' , '"+ req.body.phone +"' , '"+ req.body.email +"' , '"+ req.body.dob +"' , '"+ req.body.designation +"' , '"+ req.body.experience +"' , '"+ req.body.qualification +"' , '"+ req.body.reporting +"' , '"+ req.body.area_of_specialization +"' , '"+ req.body.salary +"' , '"+ req.body.address +"' , '"+ req.body.aicte_id +"' ) ";

// });

app.get("/del_fac", function(req, res){
    res.render("del_fac");
})

app.post("/del_fac", function(req, res){

    var post = req.body;
    var fac_id = post.fac_id;

    connection.query ("Delete from faculty where fac_id = ? ", [fac_id], function(error,results,fields){
   
        
        res.render('del_fac');
        
    });
});



app.get("/research_guides", function(req, res){
    res.render("research_guides");
})



// ------research proj page------
app.get("/research_proj", function(req, res){
    res.render("research_proj");
})

app.post("/research_proj", function(req, res){

    var sql = "insert into research_project values ( '" + req.body.fac_id +"' , '"+ req.body.name_of_rp +"' , '"+ req.body.pi_name +"' , '"+ req.body.dept_ri +"' , '"+ req.body.year +"' , '"+ req.body.funds +"' , '"+ req.body.name_of_fa +"' , '"+ req.body.date_from +"' , '"+ req.body.date_to +"'  , '"+ req.body.add_in +"' ) ";
    connection.query(sql, function(err){
        if (err) throw err;
        res.render('research_proj')

        res.end();
    })
});














//connect to database 
connection.connect(function(err){
    if(err) {
        console.error('error connecting...' + err.stack);
        return;
}
console.log('connected as id ' + connection.threadId);
});









app.listen(4000, function(){
  console.log("Server started on port 4000.");
});
