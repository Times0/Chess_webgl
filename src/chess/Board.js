import {Pawn, Rook, Knight, Bishop, Queen, King} from './Pieces';
import { Square } from './Square';

// Chess piece representations
const PIECES = 
{
    w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔',},
    b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',},
};

export class Board{
    constructor(debug = false)
    {
        this.debug = debug
        this.nbrow = 8;
        // 0 pas gagné 1 egalité 2 gagné
        this.iswin = 0;
        this.nbmove = 1;

        this.board = new Array(this.nbrow);
        for (let i = 0; i < this.nbrow; i++)
        {
            this.board[i] = new Array(this.nbrow).fill(null);
        }
        this.wpieces = [];
        this.bpieces = [];

        this.board[0][0] = new Rook  (new Square(0,0), 'w');
        this.board[0][1] = new Knight(new Square(0,1), 'w');
        this.board[0][2] = new Bishop(new Square(0,2), 'w');
        this.board[0][3] = new Queen (new Square(0,3), 'w');
        this.board[0][4] = new King  (new Square(0,4), 'w');
        this.board[0][5] = new Bishop(new Square(0,5), 'w');
        this.board[0][6] = new Knight(new Square(0,6), 'w');
        this.board[0][7] = new Rook  (new Square(0,7), 'w');

        this.board[7][0] = new Rook  (new Square(7,0), 'b');
        this.board[7][1] = new Knight(new Square(7,1), 'b');
        this.board[7][2] = new Bishop(new Square(7,2), 'b');
        this.board[7][3] = new Queen (new Square(7,3), 'b');
        this.board[7][4] = new King  (new Square(7,4), 'b');
        this.board[7][5] = new Bishop(new Square(7,5), 'b');
        this.board[7][6] = new Knight(new Square(7,6), 'b');
        this.board[7][7] = new Rook  (new Square(7,7), 'b');

        for(let i=0;i<this.nbrow;i++)
        {
            this.board[1][i] = new Pawn(new Square(1,i), 'w');
            this.board[6][i] = new Pawn(new Square(6,i), 'b');
        }

        this.updatePieceArray();
    }

    copy()
    {
        let cpy = new Board()
        cpy.iswin = this.iswin;
        cpy.nbrow = this.nbrow;
        cpy.nbmove = this.nbmove;

        for(let i=0;i<this.nbrow;i++)
        {
            for(let j=0;j<this.nbrow;j++)
            {
                if(this.board[i][j] === null)
                {
                    cpy.board[i][j] = null;
                    continue;
                }
                // copy piece
                else
                {
                    let position = this.board[i][j].position,
                        nbmove = this.board[i][j].nbmove,
                        color = 'w';
                    
                    if(this.board[i][j].color === 'b')
                        color = 'b'

                    if(this.board[i][j].name === 'p')
                    {
                        cpy.board[i][j] = new Pawn(position, color);
                        cpy.board[i][j].nbmove = nbmove;
                        cpy.board[i][j].passingPiece = this.board[i][j].passingPiece;
                    }
                    else if(this.board[i][j].name === 'r')
                    {
                        cpy.board[i][j] = new Rook(position, color);
                        cpy.board[i][j].nbmove = nbmove;
                    }
                    else if(this.board[i][j].name === 'n')
                    {
                        cpy.board[i][j] = new Knight(position, color);
                        cpy.board[i][j].nbmove = nbmove;
                    }
                    else if(this.board[i][j].name === 'b')
                    {
                        cpy.board[i][j] = new Bishop(position, color);
                        cpy.board[i][j].nbmove = nbmove;
                    }
                    else if(this.board[i][j].name === 'q')
                    {
                        cpy.board[i][j] = new Queen(position, color);
                        cpy.board[i][j].nbmove = nbmove;
                    }
                    else if(this.board[i][j].name === 'k')
                    {
                        cpy.board[i][j] = new King(position, color);
                        cpy.board[i][j].nbmove = nbmove;
                    }
                    
                    // if(color === 'w')
                    //     cpy.wpieces.push(cpy.board[i][j]);
                    // cpy.bpieces.push(cpy.board[i][j]);

                }
            }
        }
        cpy.updatePieceArray();
        return cpy;
    }     

    getPiece(s)
    {
        return this.board[s.getLine()][s.getRow()]; 
    }

    isCaseEmpty(s)
    {
        if(this.board[s.getLine()][s.getRow()] === null)
            return true;
        return false;
    }

    getIndexSquareArray(arr, elem)
    {
        for(let i=0;i<arr.length;i++)
        {
            if(arr[i].SquareEquals(elem))
                return i;
        }
        return -1;
    }

    printBoard()
    {
        for(let i=this.nbrow-1;i>=0;i--)
        {
            console.log(this.board[i].map(piece => 
            {
                if (piece !== null)
                    return PIECES[piece.color][piece.name];
                else
                    return '· ';
            }).join(' '));
        }
    }

    canonicalPosition()
    {
        let output='';
        for(let row=0; row<8; row++)
        {
            for(let col=0;col<8;col++)
            { 
                if(this.board[row][col] !== null)
                {      
                    if(this.board[row][col].color === 'w')
                        output=output.concat('w')
                    else
                        output=output.concat('b')
                    output=output.concat(this.board[row][col].name);
                }
                output=output.concat(',');
            }
        }
        return output;
    }

    removePiece(dest)
    {
        // garbage collector will delete the object
        this.board[dest.getLine()][dest.getRow()] = null;
    }

    movePiece(orig, dest)
    {
        let piece = this.getPiece(orig);
        //update position in Piece
        piece.move(dest,this.nbmove);
        //update position on Board
        this.board[dest.getLine()][dest.getRow()] = piece;
        this.board[orig.getLine()][orig.getRow()] = null;
        
    }

    updatePieceArray()
    {
        this.wpieces = [];
        this.bpieces = [];
        for(let i=0;i<this.nbrow;i++)
        {
            for(let j=0;j<this.nbrow;j++)
            {
                if(!this.isCaseEmpty(new Square(i,j)))
                {
                    if(this.getPiece(new Square(i,j)).color === 'w')
                        this.wpieces.push(this.board[i][j]);
                    else
                        this.bpieces.push(this.board[i][j]);
                }
            }
        }
    }

    swapColor(c)
    {
        if(c === 'w')
            return 'b';
        return 'w';
    }

    handleTake(orig, dest, turn)
    {
        let offset = -1;
        if(turn === 'b')
            offset = 1;

        // classic take
        if(!this.isCaseEmpty(dest))
        {
            if(this.getPiece(dest).color !== turn)
            {
                this.removePiece(dest);
                this.updatePieceArray();
            }
        }
        // passing take
        else if(this.getPiece(orig).name === 'p')
        {
            if(this.getPiece(orig).passingPiece !== null)
            {
                if((this.getPiece(orig)).passingPiece.SquareEquals(new Square(dest.getLine()+offset,dest.getRow())))
                {
                    this.removePiece(new Square(dest.getLine()+offset,dest.getRow()));
                    this.updatePieceArray();
                }
            }
        } 
    }

    move(orig, dest, turn, promotion)
    {         
        let chess_flag = false;
        // if the square at orig is empty
        if(this.getPiece(orig) === null)
        {
            if(this.debug)
                console.log('No piece to move');
            return false;
        }
        // wrong color
        if(this.getPiece(orig).color !== turn)
        {
            if(this.debug)
                console.log('Wrong color');
            return false;
        }
        // if destination square is the same color
        if(this.getPiece(dest) !== null)
        {
            if(this.getPiece(dest).color === turn)
            {
                if(this.debug)
                    console.log('Illegal move');
                return false;
            }
        }
        
        let lcase = this.getPiece(orig).getLegalCases(this, this.iswin === -1); // 2nd parameter to avoid castling if chess
        // if mouvement is illegal
        if(this.getIndexSquareArray(lcase,dest) === -1)
        {
            if(this.debug)
                console.log('Illegal move');
            return false;
        }
        //small and big castling
        if(this.getPiece(orig).name === 'k')
        {
            if(orig.SquareEquals(new Square(0, 4)) && dest.SquareEquals(new Square(0, 6)))
                return this.smallCastling(turn);
            else if(orig.SquareEquals(new Square(7, 4)) && dest.SquareEquals(new Square(7, 6)))
                return this.smallCastling(turn);        
            else if(orig.SquareEquals(new Square(0, 4)) && dest.SquareEquals(new Square(0, 2)))
                return this.bigCastling(turn);
            else if(orig.SquareEquals(new Square(7, 4)) && dest.SquareEquals(new Square(7, 2)))
                return this.bigCastling(turn);
        }

        // we realise all the operations on a virtual board to cancel easily
        let ecpy = this.copy();

        ecpy.handleTake(orig,dest,turn);
        ecpy.movePiece(orig,dest);  
        ecpy.handlePromote(dest, promotion);

        // if an ally mouvement leads to lose, we cancel it
        if(ecpy.check(this.swapColor(turn)).length>0)
        {
            if(this.debug)
                console.log("Mouvement leads to check");
            return false;
        }

        //if there is a check
        if(ecpy.check(turn).length>0)
        {
            // we verify checkmate
            if(!ecpy.canKingMove(ecpy.swapColor(turn)))
            {
                if(this.debug)
                    console.log('Echec et Mat');
                this.iswin = 2;
            }
            else
            {
                if(this.debug)
                    console.log('Echec');
                this.iswin = -1;
                chess_flag = true;
            }
        }

        // once we are here we upadte the real board
        this.handleTake(orig,dest,turn);
        this.movePiece(orig,dest);
        this.handlePromote(dest,promotion);
    
        this.nbmove++;
        if(this.stalemate(this.swapColor(turn)))
        {
            if(this.iswin !== 2)
                this.iswin = 1;
        }

        if(!chess_flag)
            this.iswin = 0;
    
        return true;
    }

    smallCastling(color)
    {
        let offset=0;
        if(color === 'b')
            offset = 7;

        let orig = new Square(offset,4);
        let dest = new Square(offset,6);
    
        if(this.isCaseEmpty(orig))
            return false;

        let lcase = this.getPiece(orig).getLegalCases(this);

        // if mouvement is illegal
        if(this.getIndexSquareArray(lcase,dest) === -1)
            return false;
    
        let ecpy = this.copy();
        ecpy.movePiece(orig,dest);
        ecpy.movePiece(new Square(offset,7), new Square(offset,5));

        if(ecpy.check(this.swapColor(color)).length>0)
        {
            if(this.debug)
                console.log('Mouvement lead to check');  
            return false;
        }
        this.movePiece(orig,dest);
        this.movePiece(new Square(offset,7), new Square(offset,5));
        return true;
    }

    bigCastling(color)
    {
        let offset=0;
        if(color === 'b')
            offset = 7;

        let orig = new Square(offset,4);
        let dest = new Square(offset,2);
        if(this.isCaseEmpty(orig))
            return false;

        let lcase = this.getPiece(orig).getLegalCases(this);

        // if mouvement is illegal
        if(this.getIndexSquareArray(lcase,dest) === -1)
            return false;
    
        let ecpy = this.copy();
        ecpy.movePiece(orig,dest);
        ecpy.movePiece(new Square(offset,0), new Square(offset,3));

        if(ecpy.check(this.swapColor(color)).length>0)
        {
            if(this.debug)
                console.log('Mouvement lead to check');
            return false;
        }
        this.movePiece(orig,dest);
        this.movePiece(new Square(offset,0), new Square(offset,3));
        return true;
    }

    check(color, dest)
    {
        let ccase = [],
            karr = this.bpieces,
            parr = this.wpieces;

        if(color === 'b')
        {
            parr = this.bpieces;
            karr = this.wpieces;
        }
    
        if(dest === undefined)
        {
            // find king in karr
            for(let i=0;i<karr.length;i++)
            {       
                if(karr[i].name === 'k')
                {
                    dest = karr[i].position;
                    break;
                }
            }
        }
        

        // for all opposite pieces
        for(let i=0;i<parr.length;i++)
        {
            // if they can reach dest
            if(this.getIndexSquareArray(parr[i].getLegalCases(this),dest) !== -1)
            {
                ccase.push(parr[i].position);
            }
        }
        return ccase;
    }

    promote(orig, c)
    {
        let pcolor = 'w';
    
        if(this.getPiece(orig).color === 'b')
            pcolor = 'b';
    
        this.board[orig.getLine()][orig.getRow()] = null;

        switch(c)
        {
            case 'q':
                this.board[orig.getLine()][orig.getRow()] = new Queen(orig,pcolor);
            break;
            case 'r':
                this.board[orig.getLine()][orig.getRow()] = new Rook(orig,pcolor);
            break;
            case 'b':
                this.board[orig.getLine()][orig.getRow()] = new Bishop(orig,pcolor);
            break;
            case 'n':
                this.board[orig.getLine()][orig.getRow()] = new Knight(orig,pcolor);
            break;
            default:
            break;
        }
        this.updatePieceArray();
    }

    handlePromote(dest, c)
    {
        //handle promotion
        if(c !== undefined)
            if(this.getPiece(dest).name === 'p')
                if(this.getPiece(dest).position.getLine() === 0 || this.getPiece(dest).position.getLine() === 7)
                    this.promote(dest, c);
    }

    canKingMove(c)
    {
        //tester si toutes les positions du roi mettent en echec et si aucune piece alliés ne peut prensre l'assaillant
        let checksquare = [],
            karr = this.wpieces,
            indexk = 0;
        
        if(c === 'b')
            karr = this.bpieces;
    
        // find index of the king
        for(let i=0;i<karr.length;i++)
        {
            if(karr[i].name === 'k')
            {
                indexk = i;
                break;
            }
        }
        // all the legal position of the king
        let kpos = karr[indexk].getLegalCases(this);

        // position of pieces who check the king
        checksquare = this.check(this.swapColor(c));
    
        if(checksquare.length === 1)
        {
            let intcase = this.getPiece(checksquare[0]).getIntermediateCases(karr[indexk].position);
            // verify if a piece can take the attacker
            for(let i=0;i<karr.length;i++)
            {
                // except the king
                if(karr[i].name !== 'k')
                {
                    // verify if the piece can intervene between king and attcker
                    for(let scase of intcase)
                    {
                        if(this.getIndexSquareArray(karr[i].getLegalCases(this),scase) !== -1)
                            return true;
                    }
                }
            }
        }
    
        // if the king can move without be cheched
        for(let ccase of kpos)
        {
            // if the king move with a take
            if(!this.isCaseEmpty(ccase))
            {
                let temp = this.getPiece(ccase);
            
                // delete the piece and verify if it is checked
                this.board[ccase.getLine()][ccase.getRow()] = null;
                if(this.check(this.swapColor(c), ccase).length === 0)
                {
                    this.board[ccase.getLine()][ccase.getRow()] = temp;
                    return true;
                }
                this.board[ccase.getLine()][ccase.getRow()] = temp;
            }
            else
            {
                // verify if it is checked
                if(this.check(this.swapColor(c), ccase).length === 0)
                    return true;
            }
        }
        return false;
    }

    stalemate(c)
    {
        let karr = this.wpieces;
        if(c === 'b')
            karr = this.bpieces;
    
        // for all the pieces
        for(let i=0;i<karr.length;i++)
        {
            let lcase = karr[i].getLegalCases(this);
            // for each case reachable by the piece
            for(let ccase of lcase)
            {
                let temp = null; 
            
                if(!this.isCaseEmpty(ccase))
                    temp = this.getPiece(ccase);
            
                let postemp = karr[i].position;
            
                // move the piece
                karr[i].move(ccase,karr[i].nbmove);
                this.board[ccase.getLine()][ccase.getRow()] = karr[i];
                this.board[postemp.getLine()][postemp.getRow()] = null;
                this.updatePieceArray();
            
                // if the piece can move, restore the initial board and quit
                if(this.check(this.swapColor(c)).length === 0)
                {
                    this.board[ccase.getLine()][ccase.getRow()] = temp;
                    this.board[postemp.getLine()][postemp.getRow()] = karr[i];
                    karr[i].move(postemp,karr[i].nbmove);
                    this.updatePieceArray();
                    return false;
                }
                // restore the board
                this.board[ccase.getLine()][ccase.getRow()] = temp;
                this.board[postemp.getLine()][postemp.getRow()] = karr[i];
                karr[i].move(postemp,karr[i].nbmove);
                this.updatePieceArray();
            }
        }
        // if any piece can move -> stalemate
        return true;
    }

}

// // Initial chess board state in FEN notation
// const INITIAL_BOARD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
// // Parse FEN string to get the board state
//   parseFEN(fen) {
//     const [boardPart, turn, castling, enPassant, halfMoves, fullMoves] = fen.split(' ');
//     const ranks = boardPart.split('/');

//     return ranks.map(rank => {
//       return rank.split('').reduce((row, char) => {
//         if (/\d/.test(char)) {
//           // Number represents empty squares
//           const emptySquares = parseInt(char, 10);
//           for (let i = 0; i < emptySquares; i++) {
//             row.push(null);
//           }
//         } else {
//           // Letters represent pieces
//           row.push(char);
//         }
//         return row;
//       }, []);
//     });
//   }  