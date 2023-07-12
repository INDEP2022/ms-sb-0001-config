const moment = require('moment-timezone');

export class FText {
    static formatText(text: string) {
        return text
            .toLocaleLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    static formatTextDb(text: string) {
        return `unaccent(LOWER(${text}))`;
    }
}

export class LocalDate {
    static getNow(format?: any) {
        return moment.tz('America/Mexico_City').format(format);
    }

    static getCustom(data: any) {
        return moment(data).tz('America/Mexico_City').format();
    }
}