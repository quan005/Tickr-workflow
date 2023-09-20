import * as moment from "moment-timezone";
import Holidays, * as holidays from "date-holidays";

export function holiday(): boolean {
    const dateTime = moment().tz('America/New_York');
    const today = dateTime.format('MM-DD');
    let isTodayAHoliday = false;

    if (today === '04-07' || today === '05-29' || today === '06-19' || today === '07-03' || today === '07-04') {
        isTodayAHoliday = true
    }

    const hd = new (holidays as any)('US', { types: ['bank', 'public'] }) as Holidays;
    const date = new Date();
    const isHoliday = hd.isHoliday(date) === false ? false : true;

    return isTodayAHoliday || isHoliday;
}

export function getMarketClose(): boolean {
    const dateTime = moment().tz('America/New_York');
    const day = dateTime.format('dddd');
    const marketClose = parseInt(dateTime.format('Hmm'));
    const isTodayAHoliday = holiday();

    return marketClose >= 1600 || day === 'Saturday' || day === 'Sunday' || isTodayAHoliday;
}