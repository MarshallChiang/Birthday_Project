# Birthday_Project


### Quick Start 
```
npm run start 
```
server will be hosted on localhost:3000

### structure 

```
.
├── app.js
├── bin
│   └── www
├── package-lock.json
├── package.json
├── public
│   ├── dev.db
│   ├── images
│   │   └── prize
│   ├── javascripts
│   │   ├── configuration.js
│   │   ├── credential.js
│   │   ├── game.js
│   │   └── prize.js
│   └── stylesheets
│       └── style.css
├── routes
│   ├── ajax.js
│   └── index.js
└── views
    ├── error.pug
    ├── layout.pug
    ├── main.pug
    └── prize.pug
```

### configuration

in `public/javascript/configration.js`, statics object is being used as module for Game objects's initialization, and which is also overwritable.
```javascript
const statics = {
    prize : { // detail and quantity of prize
        "SP" :{"name": "Terrible Teddy eau de parfum", "quantity" :1, "left" :1},
        "A" :{"name": "Ruth's Chris Steak House", "quantity" :1, "left" :1},
        "B" :{"name": "Terrible Teddy eau de parfum", "quantity" :1, "left" :1},
        "C" :{"name": "Tseng Noodles", "quantity" :5, "left" :5},
        "D" :{"name": "City Prima", "quantity" :50, "left" :50},
        "Last" :{"name": "???", "quantity" :1, "left" :1}
    },
    scratchPoint : 622, // integer for a scratch game cost
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
```


