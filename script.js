function elapsedDays(startDate, endDate) {
    timeElapsed = endDate - startDate;
    daysElapsed = ((timeElapsed/1000)/3600)/24;
    return daysElapsed;
}

var vm = new Vue({
    el: '#app',
    data: {
        cpdata: "",
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
            var data = this.cpdata
            
            var amount = data.match(/(-|)\$[0-9,]{1,}.\d{2}/g);
            var place = data.match(/[0-9]{5} : [A-Z]{1,}/g);
            if(data.match(/	[1,2,5]	/g)) {
                var account = data.match(/	[1,2,5]	/g);
                for(i = 0; i < account.length; i++) {
                    account[i] = account[i][1];
                }
            } else {
                var account = data.match(/\$[0-9,]{1,}.\d{2}\n\d\n/g);
                for(i = 0; i < account.length; i++) {
                    account[i] = account[i][account[i].length -2];
                }
            }

            var initialBalance = 0;

            for (i = 0; i < amount.length; i++) { 
                if(place[i].slice(8) == "FABO" && (account[i] == 1 || account[i] == 2)) {
                    amount[i] = amount[i].replace(/,/g, "");
                    if(amount[i][0] == "-") {
                        initialBalance -= parseFloat(amount[i].slice(2));
                    } else {
                        initialBalance += parseFloat(amount[i].slice(1));
                    }    

                } else if(place[i].slice(8) == "FABO" && account[i] == 5) {
                    initialBalance += parseFloat(amount[i].slice(1)/2);
                }
            };
            initialBalance = initialBalance*2;
            
            return initialBalance.toFixed(2);
        },
        trns: function() {
            var data = this.cpdata
                     
            var date = data.match(/\d{2}\/\d{2}\/\d{4}/g);
            var time = data.match(/\d{1,2}:\d{2}:\d{2} (?:PM|AM)/g);
            var amount = data.match(/(-|)\$[0-9,]{1,}.\d{2}/g);
            var place = data.match(/[0-9]{5} : [A-Z]{1,}/g);
            if(data.match(/	[1,5]	/g)) {
                var account = data.match(/	[1,2,5]	/g);
                for(i = 0; i < account.length; i++) {
                    account[i] = account[i][1];
                }
            } else {
                var account = data.match(/\$[0-9,]{1,}.\d{2}\n\d\n/g);
                for(i = 0; i < account.length; i++) {
                    account[i] = account[i][account[i].length -2];
                }
            }
            
            var numTrns = place.length;
            var extraDates = date.length - place.length;

            var trns = [];

            for (i = 0; i < numTrns; i++) { 
                if(place[i].slice(8) != "FABO") {
                    trns.push({ 
                        date: date[i+extraDates], 
                        time: time[i],
                        amount: amount[i],
                        place: place[i].slice(8), // Fix this hack with regex
                        account: account[i]
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
                    if(transation.account == 1 || transation.account == 2) {
                        totalSpent += parseFloat(transation.amount.slice(2) * 2);
                    } else if(transation.account == 5) {
                        totalSpent += parseFloat(transation.amount.slice(2));
                    }
                }
            });
            totalSpent = totalSpent.toFixed(2);
            return totalSpent;
        },
        avgSpent: function() {
            var stmntStartDate = Date.parse(this.trns[0].date);
            var stmntEndDate = new Date;

            var stmntLength = Math.floor(elapsedDays(stmntStartDate, stmntEndDate));

            // Calculate Average Spent per Day

            var avgSpent = this.totalSpent / stmntLength;
            var avgSpent = avgSpent.toFixed(2);
            return avgSpent;
        },
        totalDays: function() {
            var firstTrnsDate = this.trns[0].date;
            var startDateF = new Date(firstTrnsDate.substring(6,10), firstTrnsDate.substring(0,2) - 1, firstTrnsDate.substring(3,5)).getTime();
            var _lastExamDayF = (this.lastExamDayF === "") ? 21 : this.lastExamDayF;
            var endDateF = new Date(2017, 11, _lastExamDayF).getTime();
            var _lastExamDayW = (this.lastExamDayW === "") ? 26 : this.lastExamDayW;
            var startDateW = new Date(2018, 01, 04).getTime();
            var endDateW = new Date(2018, 04, _lastExamDayW).getTime();
            
            var totalDays = elapsedDays(startDateF, endDateF) + elapsedDays(startDateW, endDateW);

            return totalDays;
        },
        allowedSpending: function() {
            var numWeeksTotal = Math.floor(this.totalDays / 7);
            this.numWeekendsAway = numWeeksTotal * this.prcntWeekendsAway/100;
            var _numIndvDaysAway = (this.numIndvDaysAway == "") ? 0 : this.numIndvDaysAway;
            var numDaysAway = (this.numWeekendsAway*2) + parseInt(_numIndvDaysAway) + this.readingWeekAwayF*9 + this.readingWeekAwayW*9;
            this.payingDays = this.totalDays - numDaysAway;
            var allowedSpending = this.initialBalance / this.payingDays;

            return allowedSpending.toFixed(2);
        },
        spendingColor: function() {
            spendingColor = "black";
            if (this.costPerDay < this.allowedSpending*0.95) {
                spendingColor = "green";
            } else if (this.costPerDay > this.allowedSpending) {
                spendingColor = "red";
            } else {
                spendingColor = "orange";
            }
            return spendingColor;
        },
        remainingAmountAvg: function() {
            var remainingAmountAvg = this.initialBalance - this.costPerDay*this.payingDays;
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
        amountRemaining: function() {
            var amountRemaining = this.initialBalance - this.totalSpent;
            return amountRemaining.toFixed(2);
        },
        pastWeekAmount: function() {
            var daysElapsed = 0;
            var numTrns = this.trns.length - 1;
            var i = 0;
            var today = new Date;
            var weekAgoTrns = 0;
            var weekAmount = 0;
            while (daysElapsed < 7) {
                transation = this.trns[numTrns - i];
                daysElapsed = elapsedDays(Date.parse(transation.date), today);
                if(transation.amount[0] === "-" && daysElapsed < 7) {
                    if(transation.account == 1 || transation.account == 2) {
                        weekAmount += parseFloat(transation.amount.slice(2) * 2);
                    } else if(transation.account == 5) {
                        weekAmount += parseFloat(transation.amount.slice(2));
                    }
                }
                i++;
            }
            return weekAmount.toFixed(2);
        }
        // locations: function() {

        //     var locations = [];

        //     for(i = 0; i < this.trns.length; i++) {
        //         for(x = 0; x < locations.length; x++) {
        //             var match = false;
        //             if(this.trns[i].place == locations[x].location) {
        //                 locations[x].timesVisited++;
        //                 match = true;
        //                 break;
        //             }
        //         }
        //         if(!match) {
        //             locations[locations.length] = {
        //                 "location": this.trns[i].place,
        //                 "timesVisited": 1
        //             }
        //         }
        //     }
        //     return locations;
        // }

    }
});