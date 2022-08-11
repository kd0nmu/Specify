//This script contains the functions needed to set up a new users datapod to work with Specify WebApp

/*Objectives:
	create a file directory
	create an entry in the Log of New Users
	assign values to the variables used in constructing their personal html page
*/

const specifyDirectory = '//usersDataPodId/Specify/Recycling' //Specify's data is always stored in certain directory

let NewUser = function(userDataPodId, dataPodHostUrl) {
	this.nextIdNumber = 1 //this should be a class variable which we can increment after each assignment
	this.dataPodHostUrl = dataPodHostUrl;
	this.dataPodUrl = this.dataPodHostUrl + this.userDataPodId;//string
	this.specifyDirectoryExists = function() {
		//search for the directory
		//return true if it exists, false if it does not exist
	};
	this.assignUserId = function() {
		this.idNumber = NewUser.nextIdNumber
		NewUser.nextIdNumber = NewUser.NextIDNumber + 1
	};
	this.createLogEntry = function() {
		//write this data to a log file for usage tracking
	};
	this.createSpecifyDirectory = function() {
		//create a directory in the users data pod (may need to ask for User's Permission to Create a new Container)
		//set permissions for the Specify Container file structure- need read, write, append, delete
			//Specify is "the client", accessing data from the web server @"usersDataPod"
			//(it would be more secure if only specify had permission to read/write/append/delete)

	};
	this.checkSecurity = function() {
		//check to see if the security keys match. If they do not, there is evidence of hacking
	};



}


let directoryExists = function() {
	d = specifyDirectory
	ud = userDataPod
}		