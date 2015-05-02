var UserBox = React.createClass({
	mixins: [ReactFireMixin],

	getInitialState: function() {
	    return {
	        user: {}
	    };
	},

	componentWillMount: function() {
	    var ref = new Firebase("https://popping-inferno-4625.firebaseio.com/users/1");
	    this.bindAsObject(ref, "user");
	},	

	render: function() {

            	var teams = [];
            	if (this.state.user.teams) {
           	 	for (var i = 0; i < this.state.user.teams.length; i++) {
          	  		teams.push(<li>
          	  			{this.state.user.teams[i].name} — 
          	  			{this.state.user.teams[i].price}</li>)
           	 	}
      	  	}	

		return ( 
			<div className = "userBox" >
			<h3> {this.state.user.name } </h3>
			<div>Осталось { this.state.user.remains } очков</div>

             		<div>Команды: <ul> {teams} </ul></div></div>
        	);
	}
});

React.render(<UserBox />,
    document.getElementById('content')
);
