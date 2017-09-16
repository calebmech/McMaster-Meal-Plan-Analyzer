var basicAccountA = 3530
var basicAccountB = 2465

mealPlanAmounts = {
    groupA: {
        "minimum": basicAccountA + 250,
        "light": basicAccountA + 450,
        "regular": basicAccountA + 650,
        "varsity": basicAccountA + 850
    },
    groupB: {
        "minimum": basicAccountB + 250,
        "light": basicAccountB + 450,
        "regular": basicAccountB + 650,
        "varsity": basicAccountB + 850
    }
};

function elapsedDays(startDate, endDate) {
    timeElapsed = endDate - startDate;
    daysElapsed = ((timeElapsed/1000)/3600)/24;
    return daysElapsed;
}

var vm = new Vue({
    el: '#app',
    data: {
        cpdata: "",
        mealPlan: "groupA.minimum",
        prcntWeekendsAway: 10,
        readingWeekAwayF: true,
        readingWeekAwayW: true,
        numIndvDaysAway: 0,
        lastExamDayF: 21,
        lastExamDayW: 26,
        numWeekendsAway: 0,
        payingDays: 0,
        moreOptions: false,
        showHelp: false
    },
    computed: {
        initialBalance: function() {
            return mealPlanAmounts[this.mealPlan.split(".")[0]][this.mealPlan.split(".")[1]];
        },
        trns: function() {
            var data = this.cpdata
                     
            var date = data.match(/\d{2}\/\d{2}\/\d{4}/g);
            var time = data.match(/\d{1,2}:\d{2}:\d{2} (?:PM|AM)/g);
            var amount = data.match(/-\$\d{1,}.\d{2}/g);
            var place = data.match(/[0-9]{5} : [A-Z]{1,}/g);
            
            var numTrns = amount.length;

            var trns = [];

            for (i = 0; i < numTrns; i++) { 
                if(place[i].slice(8) != "FABO") {
                    trns.push({ 
                        date: date[i+2], 
                        time: time[i],
                        amount: amount[i],
                        place: place[i].slice(8) // Fix this hack with regex
                    });
                }
            };

            trns.reverse();
            return trns;
        },
        totalSpent: function() {
            var totalSpent = 0;
            this.trns.forEach(function(transation) {
                if(transation.amount[0] === "-") {
                    totalSpent += parseFloat(transation.amount.slice(2)) * 2;
                }
            });
            totalSpent = totalSpent.toFixed(2);
            return totalSpent;
        },
        avgSpent: function() {
            var stmntStartDate = Date.parse(this.trns[0].date);
            var stmntEndDate = new Date;

            var stmntLength = Math.ceil(elapsedDays(stmntStartDate, stmntEndDate));

            // Calculate Average Spent per Day

            var avgSpent = this.totalSpent / stmntLength;
            var avgSpent = avgSpent.toFixed(2);
            return avgSpent;
        },
        allowedSpending: function() {
            var startDateF = new Date(2017, 08, 05).getTime();
            var endDateF = new Date(2017, 11, this.lastExamDayF).getTime();
            var startDateW = new Date(2018, 01, 04).getTime();
            var endDateW = new Date(2018, 04, this.lastExamDayW).getTime();

            var totalDays = elapsedDays(startDateF, endDateF) + elapsedDays(startDateW, endDateW);

            var numWeeksTotal = Math.floor(totalDays / 7);
            this.numWeekendsAway = numWeeksTotal * this.prcntWeekendsAway/100;
            var numDaysAway = (this.numWeekendsAway*2) + this.numIndvDaysAway + this.readingWeekAwayF*9 + this.readingWeekAwayW*9;
            this.payingDays = totalDays - numDaysAway;
            var allowedSpending = this.initialBalance / this.payingDays;

            return allowedSpending.toFixed(2);
        },
        spendingColor: function() {
            spendingColor = "black";
            if (this.avgSpent < this.allowedSpending*0.85) {
                spendingColor = "green";
            } else if (this.avgSpent <= this.allowedSpending) {
                spendingColor = "orange";
            } else {
                spendingColor = "red";
            }
            return spendingColor;
        },
        remainingAmountAvg: function() {
            var remainingAmountAvg = this.initialBalance - this.costPerDay*this.payingDays
            return remainingAmountAvg.toFixed(2);
        },
        activeDays: function() {
            var activeDays = 1;
            var previousDate = this.trns[0].date;

            for(i = 0; i < this.trns.length; i++) {
                if(this.trns[i].date != previousDate) {
                    var previousDate = this.trns[i].date;
                    activeDays++;
                }
            }
            return activeDays;
        },
        costPerDay: function() {
            var costPerDay = this.totalSpent / this.activeDays;
            return costPerDay.toFixed(2);
        },
        locations: function() {

            var locations = [];

            for(i = 0; i < this.trns.length; i++) {
                for(x = 0; x < locations.length; x++) {
                    var match = false;
                    if(this.trns[i].place == locations[x].location) {
                        locations[x].timesVisited++;
                        match = true;
                        break;
                    }
                }
                if(!match) {
                    locations[locations.length] = {
                        "location": this.trns[i].place,
                        "timesVisited": 1
                    }
                }
            }
            return locations;
        }

    }
});