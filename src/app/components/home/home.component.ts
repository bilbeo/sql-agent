import { Component, OnInit } from '@angular/core';
import { UserService } from '../../providers/user.service';
import { Router } from '@angular/router';
import { DBMongoService } from '../../providers/db-mongo.service';
import { DBMySqlService } from '../../providers/db-mysql.service';
import { DbCredentials } from '../../interfaces/db-credentials';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  message;
  output;
  user: User;
  workspaces;

  constructor(
    private userService: UserService,
    private router: Router,
    private mongoService: DBMongoService,
    private sqlService: DBMySqlService) { }

  ngOnInit() {
    this.getUserDetails();

  }

  getUserDetails() {
    this.userService.getUser()
      .subscribe(
        (user) => {
          this.user = user;
        },
        (err) => {
          this.message = err;
        }
      );
  }

  signout() {
    this.userService.signout().subscribe(
      (result) => {
        this.router.navigate(['/auth']);
      },
      (err) => { });
  }


  // db connection related functionality below

  connectMySql() {

    const connectionDetails: DbCredentials = {
      host: 'test',
      port: 3306,
      user: 'username',
      password: 'password',
      db: 'databaseName'
    };

    this.sqlService.connect(connectionDetails, (err) => {
      console.log(err);
      if (err) {
        return;
      }

      this.queryMySql();
    });
  }

  queryMySql(query?) {
    const queryString = query || `SELECT InvoiceDate as 'date', Total as 'value', BillingCountry as 'breakdown_Country' FROM Invoice`;

    this.sqlService.queryDB(queryString)
      .subscribe(
        (result) => {
          this.output = result;
        },
        (err) => {
        });
  }

  connectMongo() {
    const connectionDetails: DbCredentials = {
      host: 'test',
      port: 27017,
      user: 'username',
      password: 'password',
      db: 'databaseName'
    };

    this.mongoService.connect(connectionDetails, (err) => {
      console.log(err);
      if (err) {
        return;
      }
      this.queryMongo();
    });
  }

  queryMongo(query?) {

    const queryString = query || `instructions.aggregate([
      { '$project': {
          '_id': 0,
          'value': '$amount',
          'date': '$processDate',
          'breakdown_type': '$type'
         }
      }
  ])`;

    this.mongoService.queryDB(queryString)
      .subscribe(
        (result) => {
          this.output = result;
        },
        (err) => { });
  }



}
