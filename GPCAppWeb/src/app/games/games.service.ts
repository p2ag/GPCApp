import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Game } from './game.module';
import { isUndefined } from 'util';


@Injectable({providedIn: 'root'})
export class GamesService {

    private gamesListSteam: Game[] = [];
    private gamesListAllSteam = new Map<string, number>();
    private gamesListGog: Game[] = [];

    gamesListChangedSteam = new Subject<any>();
    gamesListChangedGog = new Subject<any>();

    private gameSteam: any[];
    private gameGog: any[];

    private mockGogGame: Game;
    private mockSteamGame: Game;

    private gamePriceSteam: number;
    private gamePriceGog: number;


/////////////////////////////////////////////////////////////////////////////////////////
// STEAM //
    setGamesListAllSteam(games: any[]): boolean {
        if (games !== undefined) {
            // TODO detecting duplicates and inserting them into dictioanary with some subfix.
            for (let i = 0; i < games.length; i++) {
                this.gamesListAllSteam.set(games[i].Value, games[i].Key);
            }
            console.log('---');
            console.log(this.gamesListAllSteam.size);
            console.log('---');
            // console.log(this.gamesListAllSteam);
            // console.log(games[1]['Key']);
            // console.log(games[1]['Value']);



            // if (games.hasOwnProperty('app')) {
            //     for (let i = 0; i < games['app'].length; i++) {
            //         this.gamesListAllSteam[games['app'][i].name] = games['app'][i];
            //     }
            // } else if (games.hasOwnProperty('applist')) {
            //     for (let i = 0; i < games['applist']['apps']['app'].length; i++) {
            //         this.gamesListAllSteam[games['applist']['apps']['app'][i].name] = games['applist']['apps']['app'][i];
            //     }
            // }
        }
        console.log('Steam game list All: ', games);
        return this.gamesListAllSteam.size > 1;
    }

    getGamesListAllSteam() {
        return this.gamesListAllSteam;
    }

    clearGamesListAllSteam() {
        this.gamesListAllSteam.clear();
    }

    setGamesListSteam(game: any, isLastGame?: boolean) {
        // console.log(game);
        for (const item in game) {
            if (game.hasOwnProperty(item) && game[item].hasOwnProperty('data') && game[item]['data'].hasOwnProperty('price_overview')) {
                // it is always only one element.
                // TODO: do this wiser
                const isFree = game[item]['data'].hasOwnProperty('is_free') && game[item]['data']['is_free'] === true ? true : false;
                  let price, currency;
                if (isFree) {
                    price = undefined;
                    currency = 'Free';

                } else {
                    price = +(game[item].data.price_overview.final) / 100;
                    currency = game[item].data.price_overview.currency;
                }

                this.gamesListSteam.push(
                   new Game(
                    +item,
                    game[item].data.name,
                    game[item].data.header_image,
                    game[item].about_the_game,
                    'steam',
                    price,
                    currency
                    )
                );
            }
        }
        this.gamesListChangedSteam.next(this.gamesListSteam.slice());
        if (isLastGame) {
            console.log('steamGameList: ', this.gamesListSteam);
        }
    }

    getGamesListSteam() {
        return this.gamesListSteam;
    }

    clearGamesListSteam() {
        this.gamesListSteam.length = 0;
    }

    getIndexesOfSearchedGamesSteam(searched: string): string[] {
        const indexes: string[] = [];
        const regex = new RegExp(`${searched.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, '\g\i');
        console.log(this.gamesListAllSteam.values());

        this.gamesListAllSteam.forEach((id, key) => {
            if (regex.test(key)) {
                indexes.push(id.toString());
            }
        });
        console.log('Steam game indexes: ', indexes);
        return indexes;
    }

    sortGamesListSteam() {
        this.gamesListSteam.sort( (a, b) => a.price > b.price ? -1 : 1);
        this.gamesListChangedSteam.next(this.gamesListSteam.slice());
    }

/////////////////////////////////////////////////////////////////////////////////////////
// GOG //
    setGamesListGog(games: any) {
        this.gamesListGog.length = 0; // making empty array as alternative to consider
        games.products.forEach(game => {
            let price, currency;
            if (game.symbol = 'zł') {
                currency = 'PLN';
            }
            if (game.price.finalAmount === '0.00') {
                price = undefined;
                currency = 'Free';
            } else {
                price = game.price.finalAmount;
            }
            this.gamesListGog.push(
                new Game(
                    +game.id,
                    game.title,
                    game.image + '.jpg',
                    'test',
                    'gog',
                    price,
                    currency
                    )
                );
        });
        this.gamesListChangedGog.next(this.gamesListGog.slice());
        console.log('gogGameList: ', this.gamesListGog);

    }

    getGamesListGog() {
        return this.gamesListGog;
    }

/////////////////////////////////////////////////////////////////////////////////////////
    getMockGame(source: string) {
        if (source === 'gog') {
            return this.mockGogGame;
        } else if (source === 'steam') {
            return this.mockSteamGame;
        } else {
            console.log('getMockGame - wrong type of source');
        }
    }

    setMockGame(game: any, source: string) {
        if (source === 'gog') {
            console.log('gogMockGame', game);
            this.mockGogGame = new Game(game.id, game.title, game.images.logo2x, 'test', 'gog');
        } else if (source === 'steam') {
            console.log('steamMockGame', game);
            for (const item in game) {
                if (game.hasOwnProperty(item)) {
                    // it is always only one element.
                    // TODO: do this wiser
                   this.mockSteamGame = new Game(
                        +item,
                        game[item].data.name,
                        game[item].data.header_image,
                        game[item].about_the_game,
                        'steam',
                        +(game[item].data.price_overview.final) / 100,
                        game[item].data.price_overview.currency);
                }
            }
        } else {
            console.log('setMockGame - wrong type of source');
        }
    }

    setMockGamePrice(game: any) {
        const price = game._embedded.prices[0].basePrice;
        this.mockGogGame.price = +(price.substring(0, price.indexOf(' ')) / 100);
        this.mockGogGame.currency = price.substring( price.indexOf(' '), price.length);
    }

    moveToTopOfList(game: Game, listType: string) {
        this.setPricesToCompare(isUndefined(game.price) ? 0 : +game.price, listType);
        if (listType === 'steam') {
            this.gamesListSteam.splice(this.gamesListSteam.indexOf(game), 1);
            this.gamesListSteam.unshift(game);
            this.gamesListChangedSteam.next(this.gamesListSteam.slice());
        } else if (listType === 'gog') {
            this.gamesListGog.splice(this.gamesListGog.indexOf(game), 1);
            this.gamesListGog.unshift(game);
            this.gamesListChangedGog.next(this.gamesListGog.slice());
        }
    }

    setPricesToCompare(price: number, source: string) {
        if (source === 'steam') {
            this.gamePriceSteam = price;
        } else if (source === 'gog') {
            this.gamePriceGog = price;
        }
    }

    comparePrices(source: string): boolean {
        if ((this.gamePriceGog !== null) && (this.gamePriceSteam !== null)) {
            if (source === 'steam') {
                return this.gamePriceSteam < this.gamePriceGog;
            } else if (source === 'gog') {
                return this.gamePriceGog < this.gamePriceSteam;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    openStorePage(gameStoreUrl: string) {
        console.log(gameStoreUrl);
        window.open(gameStoreUrl, '_blank');
    }
}
