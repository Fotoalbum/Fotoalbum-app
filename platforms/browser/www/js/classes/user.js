var User = function(){};
User.prototype = {
    setProps: function(userID, firstName, lastName, email, adress, zipcode, city, country) {
        this.userID = userID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.adress = adress;
        this.zipcode = zipcode;
        this.city = city;
        this.country = country;
    }
};