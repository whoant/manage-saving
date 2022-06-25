const maxYear = new Date().getFullYear();
const monthCurrent = new Date().getMonth() + 1;
let monthSelect = monthCurrent;
let dayCurrent = new Date().getDate();

let yearCurrent = maxYear;
let days = [];

const years = [];
for (let year = maxYear; year >= 2015; year--) {
    years.push(`<option value="${year}">${year}</option>`);
}

const months = [];
for (let month = 1; month <= 12; month++) {
    if (month === monthSelect) {
        months.push(`<option value="${month}" selected>${month}</option>`);
    } else {
        months.push(`<option value="${month}">${month}</option>`);
    }
}


$(document).ready(function() {
    $("#year").html(years.join(""));
    $("#month").html(months.join(""));
    renderDay();

    $("#year").change(function() {
        yearCurrent = $(this).val();
        renderDay();
    });

    $("#month").change(function() {
        monthSelect = $(this).val();
        renderDay();
    });

    $("#btn-confirm").click(function() {
        let dateSelected = $("#day").val();
        if (dateSelected.length < 2) dateSelected = "0" + dateSelected;

        if (monthSelect.toString().length < 2) monthSelect = "0" + monthSelect;

        $("#show-day").text(`Báo cáo doanh số hoạt động ngày : ${dateSelected}/${monthSelect}/${yearCurrent}`);
        const time = `${yearCurrent}-${monthSelect}-${dateSelected}`;
        getReport(time);
    });

});

function renderDay() {
    const totalsDay = moment(`${yearCurrent}-${monthSelect}`, "YYYY-MM").daysInMonth();
    days = Array.from(Array(totalsDay).keys()).map(day => `<option value="${day + 1}">${day + 1}</option>`);
    if (yearCurrent === maxYear && monthCurrent === monthSelect) {
        days.length = dayCurrent;
    }
    days = days.reverse();
    $("#day").html(days.join(""));
}

async function getReport(time) {
    try {
        const { data } = await axios.get(`/manager/report-detail?date=${time}`);

        const render = data.data.map((item, i) => renderHTML(i, item));
        $("#tbody").empty();
        $("#tbody").append(render.join(""));

    } catch (e) {
        console.error(e);
    }
}

function renderHTML(i, obj) {
    return `<tr><th scope="row">${i + 1}</th><td>${obj.name}</td><td>${obj.in}</td><td>${obj.out}</td><td>${obj.diff}</td></tr>`;
}
