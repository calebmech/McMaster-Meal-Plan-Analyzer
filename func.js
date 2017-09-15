// var cpdata = `Logo Image	

// ACCOUNT 
// FINANCIAL 
// ADD CASH
//  LOG OFF
// Transactions
// Quick Search
// Past 30 days
// Past 60 days
// Select a Date Range
//  From:   
// 08/26/2017
//  To:   
// 09/14/2017
  
// Date	Amount	Balance	Units	Trantype	Terminal
// 09/14/2017 7:02:20 PM	-$4.27	1	0	004 : VEND (MONEY)	00084 :  BRIDGES-1
// 09/14/2017 11:45:44 AM	-$4.24	1	0	004 : VEND (MONEY)	00011 : LAPIAZZA-1
// 09/13/2017 7:08:43 PM	-$3.67	1	0	004 : VEND (MONEY)	00084 : BRIDGES-1
// 09/13/2017 12:23:54 PM	-$3.75	1	0	004 : VEND (MONEY)	00021 : LAPIAZZA-3
// 09/12/2017 7:46:28 PM	-$1.04	1	0	004 : VEND (MONEY)	00046 : MMM-TH
// 09/12/2017 6:48:21 PM	-$3.57	1	0	004 : VEND (MONEY)	00046 : MMM-TH
// 09/12/2017 12:42:20 PM	-$3.97	1	0	004 : VEND (MONEY)	00048 : LAPIAZZA-4
// 09/11/2017 6:55:31 PM	-$2.97	1	0	004 : VEND (MONEY)	00048 : LAPIAZZA-4
// 09/11/2017 1:55:52 PM	-$4.12	1	0	004 : VEND (MONEY)	00063 : MMM-1
// 09/08/2017 5:47:31 PM	-$3.99	1	0	004 : VEND (MONEY)	00015 : TERIYAKI (MIJ)
// 09/07/2017 6:29:31 PM	-$5.94	1	0	004 : VEND (MONEY)	00060 : EMW-2
// 09/07/2017 1:32:23 PM	-$3.72	1	0	004 : VEND (MONEY)	00048 : LAPIAZZA-4
// 09/06/2017 6:46:53 PM	-$4.99	1	0	004 : VEND (MONEY)	00037 : CENTRO 1
// 09/06/2017 12:27:48 PM	-$1.79	1	0	004 : VEND (MONEY)	00138 : LAPIAZZA-2
// 09/05/2017 12:08:26 PM	-$4.28	1	0	004 : VEND (MONEY)	00015 : TERIYAKI (MIJ)
// 09/01/2017 6:03:16 PM	-$5.60	1	0	004 : VEND (MONEY)	00046 : MMM-TH
// 09/01/2017 10:28:46 AM	-$1.92	1	0	004 : VEND (MONEY)	00063 : MMM-1
// 08/31/2017 11:18:15 AM	-$4.99	1	0	004 : VEND (MONEY)	00031 : CENTRO 3
// 08/30/2017 5:06:23 PM	-$6.49	1	0	004 : VEND (MONEY)	00025 : EMW-1
// 08/30/2017 12:25:48 PM	-$3.47	1	0	004 : VEND (MONEY)	00138 : LAPIAZZA-2
// 08/28/2017 5:30:38 PM	-$3.57	1	0	004 : VEND (MONEY)	00046 : MMM-TH
// 08/28/2017 1:53:28 PM	-$7.02	1	0	004 : VEND (MONEY)	00025 : EMW-1
// 08/28/2017 8:29:32 AM	-$4.40	1	0	004 : VEND (MONEY)	00040 : CENTRO 2
// 08/26/2017 1:29:18 PM	-$12.95	1	0	102 : ACCOUNT ADJUSTMENT	00053 : FABO MANAGER
//  2014 Heartland Campus Solutions
// OneWeb ver. 6.9.1.20`;

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

function findStringEndPos(data, str) {
    var startPos = data.search(str);
    var endPos = startPos + str.length;
    return endPos;
}

function parseData(cpdata) {
    var headerString = "Date	Amount	Balance	Units	Trantype	Terminal";
    var headerEndPos = findStringEndPos(cpdata, headerString);

    var footerString = "2014 Heartland Campus Solutions"
    var footerStartPos = cpdata.search(footerString);

    var cpdata = (cpdata.substring(headerEndPos+1, footerStartPos));

    var numTrns = cpdata.match(/\n/g).length - 1;

    var date = cpdata.match(/\d{2}\/\d{2}\/\d{4}/g);
    var time = cpdata.match(/\d{1,2}:\d{2}:\d{2} (?:PM|AM)/g);
    var amount = cpdata.match(/-\$\d{1,}.\d{2}/g);
    var place = cpdata.match(/[0-9]{5} : [A-Z]{1,}/g);

    var trns = [];

    for (i = 0; i < numTrns; i++) { 
        trns.push({ 
            date: date[i], 
            time: time[i],
            amount: amount[i],
            place: place[i].slice(8) // Fix this hack with regex
        });
    };

    trns.reverse();

    return trns;
}

function elapsedDays(startDate, endDate) {
    timeElapsed = endDate - startDate;
    daysElapsed = ((timeElapsed/1000)/3600)/24;
    return daysElapsed;
}

function calcAllowedSpending(initialBalance, prcntWeekendsAway, readingWeekAwayF, readingWeekAwayW, numIndvDaysAway, lastExamDayF, lastExamDayW) {
    // var initialBalance = mealPlanAmounts.groupA.minimum;
    // var prcntWeekendsAway = 0.5;
    // var readingWeekAwayF = true;
    // var readingWeekAwayW = true;
    // var numIndvDaysAway = 0;
    // var lastExamDayF = 21;
    // var lastExamDayW = 26;

    var startDateF = new Date(2017, 08, 05).getTime();
    var endDateF = new Date(2017, 11, lastExamDayF).getTime();
    var startDateW = new Date(2018, 01, 04).getTime();
    var endDateW = new Date(2018, 04, lastExamDayW).getTime();

    var totalDays = elapsedDays(startDateF, endDateF) + elapsedDays(startDateW, endDateW);

    var numWeeksTotal = Math.floor(totalDays / 7);
    var numWeekendsAway = numWeeksTotal * prcntWeekendsAway;
    var numDaysAway = (numWeekendsAway*2) + numIndvDaysAway + readingWeekAwayF*9 + readingWeekAwayW*9;
    var payingDays = totalDays - numDaysAway;
    var allowedSpending = initialBalance / payingDays;

    return allowedSpending.toFixed(2);
}

function calcTotalSpent(trns) {
    creditSpent = 0;
    trns.forEach(function(transation) {
        if(transation.amount[0] === "-") {
            creditSpent += parseFloat(transation.amount.slice(2)) * 2;
        }
    });
    creditSpent = creditSpent.toFixed(2);

    return creditSpent;
}

function calcAvgSpent(creditSpent) {
    // Calculate Days so Far
    var stmntStartDate = Date.parse(trns[0].date);
    var stmntEndDate = Date.parse(trns[trns.length-1].date)

    var stmntLength = elapsedDays(stmntStartDate, stmntEndDate);

    // Calculate Average Spent per Day

    var avgSpending = creditSpent / stmntLength;
    var avgSpending = avgSpending.toFixed(2);

    return avgSpending;
}