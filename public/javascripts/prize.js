import { statics } from './configuration.js'

class PrizeController {
    constructor() {
        // >> Class to control the point and prize left by querying db with session_id.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        this.prize = statics.prize; 
        this.ajaxUpdate();
    }
    ajaxUpdate(key, value) {
        // >> async call to query the data from database, could be called with specified key to update value.
        // ---
        // Arguments : 
        // key (String): field to be updated.
        // value (String): value for the update.
        // ### if any parameter is undefined, will simply return the current status of this session_id.
        // ---
        // RETURN : null
        $.ajax({
            type : 'GET',
            url : (key && value)?'/ajax/update':'/ajax/query',
            data : {'target':key, 'value':value},
            success: (msg) => {
                this.point = msg.point;
                msg.prize.split(',').forEach(p => {
                    if (p) {
                        -- this.prize[p]['left'];
                    }
                });
                this.render();
            }
        })
    }
    shufflePrize() {
        // >> Select prize randomly.
        // ---
        // Arguments : 
        // ---
        // RETURN : String, ('D', 'A', 'SP' ...)
        var prizeArr = Array();
        for (let p in this.prize) {
            prizeArr = prizeArr.concat(Array(this.prize[p]['left']).fill(p));
        }
        let random = Math.floor(Math.random() * prizeArr.length);
        return prizeArr[random]
    }
    render() {
        // >> Render the prize section.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        $('#point').text(this.point);
        $('#cards').empty();
        for (var p in this.prize) {
            $('#cards').append(
                $('<div>', {'class' : 'card'}).append(
                    $('<div>', {'class' : 'row g-0'}).append(
                        $('<div>', {'class' : 'col-md-4'}).append(
                            $('<img>', {'src' : '../images/prize/'+p+'.jpeg', 'style':  'height: 120px; width: 100px;'})
                        )
                    ).append(
                        $('<div>', {'class' : 'col-md-8'}).append(
                            $('<div>', {'class': 'card-body'}).append(
                                $('<h5>', {'class': 'card-title'}).text(p + '賞 (全' + this.prize[p]['quantity'] + '種)')
                            ).append(
                                $('<p>', {'class': 'card-text'}).text(this.prize[p]['name'])
                            ).append(
                                $('<p>', {'class' : 'card-text'}).append(
                                    $('<small>', {'class' : 'text-muted'}).text(this.prize[p]['left'] + '/' + this.prize[p]['quantity'])
                                )
                            )
                        )
                    )
                )
            )
        }
    }
}

export {PrizeController}