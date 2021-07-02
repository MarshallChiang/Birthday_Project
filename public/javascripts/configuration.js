const statics = {
    prize : {
        "SP" :{"name": "Terrible Teddy eau de parfum", "quantity" :1, "left" :1},
        "A" :{"name": "Ruth's Chris Steak House", "quantity" :1, "left" :1},
        "B" :{"name": "Terrible Teddy eau de parfum", "quantity" :1, "left" :1},
        "C" :{"name": "Tseng Noodles", "quantity" :5, "left" :5},
        "D" :{"name": "City Prima", "quantity" :50, "left" :50},
        "Last" :{"name": "???", "quantity" :1, "left" :1}
    },
    scratchPoint : 622,
    game : {
        Snake : {
            field_width: 30,
            field_height: 30,
            init_speed: 150,
            init_length: 3,
            accelerate: 2.5,
            point_weight : 5
        },
        Gobang : {
            field_width: 15,
            field_height: 15,
            point_lose: 150,
            point_win: 500
        },
        Scratch : {
            field_width: 0,
            field_height: 0
        }
    }
}

export { statics }