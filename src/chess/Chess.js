import { Square } from './Square';
import { Board } from './Board';

export class Chess{
    constructor(debug=false)
    {
        this.debug = debug;
        this.board = new Board(debug);
        this.turn = 'w';
    }

    reset()
    {
        this.board = new Board();
        this.turn = 'w';
    }

    checkInput(cmd)
    {
        const mouvmtpattern = /^[a-h][1-8][a-h][1-8](q|r|b|n)?$/;
        return mouvmtpattern.test(cmd);
    }

    swapTurn()
    {
        this.turn = this.turn === 'w' ? 'b' : 'w';
    }

    print(result)
    {
        this.board.printBoard();
        this.board.canonicalPosition();
        if(result !== undefined){console.log(result);}
    }

    move(cmdOrOrig, dest, promo='q')
    {    
        if (typeof cmdOrOrig === 'string') {
            if (this.checkInput(cmdOrOrig))
            {
                let orig = new Square(cmdOrOrig.substring(0, 2));
                let dest = new Square(cmdOrOrig.substring(2, 4));
                let promotion = cmdOrOrig[4];
                if(!this.board.move(orig,dest,this.turn, promotion))
                    return null;
            }
            else 
                return null;
        }
        else if (cmdOrOrig instanceof Square)
        {
            if (cmdOrOrig.getLine() >= 0 && cmdOrOrig.getRow() < 8 && dest.getLine() >= 0 && dest.getRow() < 8 )    
                if(!this.board.move(cmdOrOrig,dest,this.turn, promo))
                    return null;
        }
        else
            return null;
        
        if(this.board.iswin === 2)
        {
            if(this.turn === 'w')
            {
                if(this.debug)    
                    this.print("1-0");
                return this.board.canonicalPosition().concat('1-0');
            }
            else
            {
                if(this.debug)
                    this.print("0-1");
                    return this.board.canonicalPosition().concat('0-1');
            }
        }
        else if(this.board.iswin === 1)
        {
            if(this.debug)
                this.print("1/2-1/2");
            return this.board.canonicalPosition().concat('1/2-1/2');
        }
    
        this.swapTurn();
        if(this.debug)
            this.print();
        
        if(this.board.iswin === -1)
            return this.board.canonicalPosition().concat('chess');
        return this.board.canonicalPosition();
    }

    getNbMove()
    {
        return this.board.nbmove;
    }

    getTurn()
    {
        return this.turn;
    }

    getPieceMove(orig)
    {
        return this.board.getPiece(orig).getLegalCases(this.board);
    }
}