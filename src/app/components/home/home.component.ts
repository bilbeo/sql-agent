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
