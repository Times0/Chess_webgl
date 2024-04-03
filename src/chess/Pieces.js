import { Square } from './Square';

class Piece{
    constructor(name, position, color)
    {
        this.name = name;
        this.position = position;
        this.color = color;
        this.nbmove = 0;
    }

    move(dest, lmove)
    {
        this.position = dest;
        this.nbmove = lmove;
    }

    getIntermediateCases(dest)
    {
        // Dest is not needed for the intermediate cases
        return [this.position];
    }
}


// Define a class for the Pawn
export class Pawn extends Piece{

    constructor(position, color)
    {
        super('p', position, color);
        this.passingPiece = null;
    }

    getLegalCases(board)
    {
        let lcase = [],
            factor = 1;
        this.passingPiece = null;
    
        if(this.color === 'b')
            factor=-1;
        
        // +2
        if(this.nbmove === 0)
        {
            if(board.isCaseEmpty(new Square(this.position.getLine()+2*factor,this.position.getRow())) && board.isCaseEmpty(new Square(this.position.getLine()+factor,this.position.getRow())))
                lcase.push(new Square(this.position.getLine()+2*factor,this.position.getRow()));
        }
        // +1
        if(board.isCaseEmpty(new Square(this.position.getLine()+factor,this.position.getRow())))
            lcase.push(new Square(this.position.getLine()+factor,this.position.getRow()));
        
        // right diagonal and passing take
        if(this.position.getRow()+1 < board.nbrow)
        {
            // diagonal right
            if(!board.isCaseEmpty(new Square(this.position.getLine()+factor,this.position.getRow()+1)))
                if(board.getPiece(new Square(this.position.getLine()+factor,this.position.getRow()+1)).color !== this.color)
                    lcase.push(new Square(this.position.getLine()+factor,this.position.getRow()+1));
        
            // passing take right 
            // if destination square is empty and taken square isn't empty 
            if(board.isCaseEmpty(new Square(this.position.getLine()+factor,this.position.getRow()+1)) && !board.isCaseEmpty(new Square(this.position.getLine(),this.position.getRow()+1)))
                // if the taken piece is a pawn
                if(board.getPiece(new Square(this.position.getLine(),this.position.getRow()+1)).name === 'p')
                    // if it has a different color and move just before
                    if(board.getPiece(new Square(this.position.getLine(),this.position.getRow()+1)).color !== this.color && board.getPiece(new Square(this.position.getLine(),this.position.getRow()+1)).nbmove + 1 === board.nbmove)
                    {
                        lcase.push(new Square(this.position.getLine()+factor,this.position.getRow()+1));
                        this.passingPiece = new Square(this.position.getLine(),this.position.getRow()+1);
                    }
        }
        // left diagonal and passing take
        if(this.position.getRow()-1 >= 0)
        {
            if(!board.isCaseEmpty(new Square(this.position.getLine()+factor,this.position.getRow()-1)))
                if(board.getPiece(new Square(this.position.getLine()+factor,this.position.getRow()-1)).color !== this.color)
                    lcase.push(new Square(this.position.getLine()+factor,this.position.getRow()-1));
        
            if(board.isCaseEmpty(new Square(this.position.getLine()+factor,this.position.getRow()-1)) && !board.isCaseEmpty(new Square(this.position.getLine(),this.position.getRow()-1)))
                if(board.getPiece(new Square(this.position.getLine(),this.position.getRow()-1)).name === 'p')
                    if(board.getPiece(new Square(this.position.getLine(),this.position.getRow()-1)).color !== this.color && board.getPiece(new Square(this.position.getLine(),this.position.getRow()-1)).nbmove + 1 === board.nbmove)
                    {
                        lcase.push(new Square(this.position.getLine()+factor,this.position.getRow()-1));
                        this.passingPiece = new Square(this.position.getLine(),this.position.getRow()-1);
                    }
        }
        return lcase;
    }
}

export class Rook extends Piece{
    constructor(position, color)
    {
        super('r', position, color);
    }

    getLegalCases(board)
    {
        let lcase = [];
        // left horizontal
        for(let i=this.position.getRow()-1;i>=0;i--)
        {
            if(!board.isCaseEmpty(new Square(this.position.getLine(),i)))
            {   
                // if the piece has a different color at its position and quit
                if(board.getPiece(new Square(this.position.getLine(),i)).color !== this.color)    
                    lcase.push(new Square(this.position.getLine(),i));
                break;
            }
            lcase.push(new Square(this.position.getLine(),i));
        }
        // right horizontal
        for(let i=this.position.getRow()+1;i<8;i++)
        {
            if(!board.isCaseEmpty(new Square(this.position.getLine(),i)))
            {
                if(board.getPiece(new Square(this.position.getLine(),i)).color !== this.color)    
                    lcase.push(new Square(this.position.getLine(),i));
                break;
            }
            lcase.push(new Square(this.position.getLine(),i));
        }
        // bottom vertical
        for(let i=this.position.getLine()-1;i>=0;i--)
        {
            if(!board.isCaseEmpty(new Square(i,this.position.getRow())))
            {
                if(board.getPiece(new Square(i,this.position.getRow())).color !== this.color)    
                    lcase.push(new Square(i,this.position.getRow()));
                break;
            }
            lcase.push(new Square(i,this.position.getRow()));
        }
        // up vertical
        for(let i=this.position.getLine()+1;i<8;i++)
        {
            if(!board.isCaseEmpty(new Square(i,this.position.getRow())))
            {
                if(board.getPiece(new Square(i,this.position.getRow())).color !== this.color)    
                    lcase.push(new Square(i,this.position.getRow()));
                break;
            }
            lcase.push(new Square(i,this.position.getRow()));
        }
        return lcase;
    }

    getIntermediateCases(dest)
    {
        let lcase=[];
        if(dest.getLine() === this.position.getLine())
        {
            for(let i=Math.min(this.position.getRow(),dest.getRow())+1; i<Math.max(this.position.getRow(),dest.getRow());i++)
            {
                lcase.push(new Square(this.position.getLine(),i));
            }
            lcase.push(this.position);
        }
        else if(dest.getRow() === this.position.getRow())
        {
            for(let i=Math.min(this.position.getLine(),dest.getLine())+1; i<Math.max(this.position.getLine(),dest.getLine());i++)
            {
                lcase.push(new Square(i,this.position.getRow()));
            }
            lcase.push(this.position);
        }
        return lcase;
    }
}

export class Knight extends Piece{
    constructor(position, color)
    {
        super('n', position, color);
    }

    getLegalCases(board)
    {
        let lcase=[];
        const pos = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        
        for(const pair of pos)
        {
            pair[0]+=this.position.getLine();
            pair[1]+=this.position.getRow();
            if(pair[0] >= 0 && pair[0] < 8 && pair[1] >= 0 && pair[1] < 8)
            {
                if(!board.isCaseEmpty(new Square(pair[0],pair[1])))
                {
                    if(board.getPiece(new Square(pair[0],pair[1])).color !== this.color)
                        lcase.push(new Square(pair[0],pair[1]));
                }
                else
                    lcase.push(new Square(pair[0],pair[1]));
            }
        }
        return lcase;
    }
}

export class Bishop extends Piece{
    constructor(position, color)
    {
        super('b', position, color);
    }

    getLegalCases(board)
    {
        let lcase=[];
        // up right
        for(let i=1; i<8;i++)
        {
            // if the position is outside the board then quit
            if(this.position.getLine()+i >= 8 || this.position.getRow()+i >= 8)
                break;
            // if there is a piece
            if(!board.isCaseEmpty(new Square(this.position.getLine()+i,this.position.getRow()+i)))
            {   
                // if the piece has the opposite color and the position and quit
                if(board.getPiece(new Square(this.position.getLine()+i,this.position.getRow()+i)).color !== this.color)    
                    lcase.push(new Square(this.position.getLine()+i,this.position.getRow()+i));
                break;
            }
            lcase.push(new Square(this.position.getLine()+i,this.position.getRow()+i));
        }
        // up left
        for(let i=1; i<8;i++)
        {
            if(this.position.getLine()+i >= 8 || this.position.getRow()-i < 0)
                break;

            if(!board.isCaseEmpty(new Square(this.position.getLine()+i,this.position.getRow()-i)))
            {   
                if(board.getPiece(new Square(this.position.getLine()+i,this.position.getRow()-i)).color !== this.color)    
                    lcase.push(new Square(this.position.getLine()+i,this.position.getRow()-i));
                break;
            }
            lcase.push(new Square(this.position.getLine()+i,this.position.getRow()-i));
        }
        // bottom left
        for(let i=1; i<8;i++)
        {
            if(this.position.getLine()-i < 0 || this.position.getRow()-i < 0)
                break;

            if(!board.isCaseEmpty(new Square(this.position.getLine()-i,this.position.getRow()-i)))
            {   
                if(board.getPiece(new Square(this.position.getLine()-i,this.position.getRow()-i)).color !== this.color)    
                    lcase.push(new Square(this.position.getLine()-i,this.position.getRow()-i));
                break;
            }
            lcase.push(new Square(this.position.getLine()-i,this.position.getRow()-i));
        }
        // bottom right
        for(let i=1; i<8;i++)
        {
            if(this.position.getLine()-i < 0 || this.position.getRow()+i >= 8)
                break;

            if(!board.isCaseEmpty(new Square(this.position.getLine()-i,this.position.getRow()+i)))
            {   
                if(board.getPiece(new Square(this.position.getLine()-i,this.position.getRow()+i)).color !== this.color)    
                    lcase.push(new Square(this.position.getLine()-i,this.position.getRow()+i));
                break;
            }
            lcase.push(new Square(this.position.getLine()-i,this.position.getRow()+i));
        }
        return lcase;
    }

    getIntermediateCases(dest)
    {
        let lcase=[];

        // bottom left
        if(dest.getLine() < this.position.getLine() && dest.getRow() < this.position.getRow())
        {
            for(let i=dest.getLine()+1; i < this.position.getLine();i++)
            {
                lcase.push(new Square(i,i-dest.getLine()+dest.getRow()));
            }
            lcase.push(this.position);
        }
        // bottom right
        else if(dest.getLine() < this.position.getLine() && dest.getRow() > this.position.getRow())
        {
            for(let i=dest.getLine()+1; i < this.position.getLine();i++)
            {
                lcase.push(new Square(i,dest.getRow() - i + dest.getLine()));
            }
            lcase.push(this.position);
        }
        // up left
        else if(dest.getLine() > this.position.getLine() && dest.getRow() < this.position.getRow())
        {
            for(let i=dest.getLine()-1; i > this.position.getLine();i--)
            {
                lcase.push(new Square(i,dest.getLine() - i + dest.getRow()));
            }
            lcase.push(this.position);
        }
        // up right
        else if(dest.getLine() > this.position.getLine() && dest.getRow() > this.position.getRow())
        {
            for(let i=dest.getLine()-1; i > this.position.getLine();i--)
            {
                lcase.push(new Square(i,dest.getRow() + i - dest.getLine()));
            }
            lcase.push(this.position);
        }
        return lcase;
    }   
}

export class Queen extends Piece{
    constructor(position, color)
    {
        super('q', position, color);
    }

    getLegalCases(board)
    {
        // union of Rook and Bishop square
        let rt = new Rook(this.position,this.color);
        let bt = new Bishop(this.position,this.color);

        let lcase = rt.getLegalCases(board);

        return lcase.concat(bt.getLegalCases(board));
    }

    getIntermediateCases(dest)
    {
        // union of Rook and Bishop square
        let rt = new Rook(this.position,this.color);
        let bt = new Bishop(this.position,this.color);

        let lcase = rt.getIntermediateCases(dest);
        return lcase.concat(bt.getIntermediateCases(dest));
    }
}

export class King extends Piece{
    constructor(position, color)
    {
        super('k', position, color);
    }

    getLegalCases(board)
    {
        let lcase=[];
        const pos = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        
        for (const pair of pos)
        {
            pair[0]+=this.position.getLine();
            pair[1]+=this.position.getRow();
            if(pair[0] >= 0 && pair[0] < 8 && pair[1] >= 0 && pair[1] < 8)
            {
                if(!board.isCaseEmpty(new Square(pair[0],pair[1])))
                {
                    if(board.getPiece(new Square(pair[0],pair[1])).color !== this.color)
                        lcase.push(new Square(pair[0],pair[1]));
                }
                else
                    lcase.push(new Square(pair[0],pair[1]));
            }
        }

        let offset=0;
        if(this.color === 'b')
            offset = 7;
    
        // small castling 
        if(!board.isCaseEmpty(new Square(offset,4)) && !board.isCaseEmpty(new Square(offset,7)))
        {
            if((board.getPiece(new Square(offset,4))).nbmove === 0 && (board.getPiece(new Square(offset,7))).nbmove === 0)
            {
                // if there is no piece between king and rook
                if(board.isCaseEmpty(new Square(offset,5)) && board.isCaseEmpty(new Square(offset,6)))
                    lcase.push(new Square(offset,6));
            }
        }
        // big castling
        if(!board.isCaseEmpty(new Square(offset,4)) && !board.isCaseEmpty(new Square(offset,0)))
        {
            if((board.getPiece(new Square(offset,4))).nbmove === 0 && (board.getPiece(new Square(offset,0))).nbmove === 0)
            {
                if(board.isCaseEmpty(new Square(offset,1)) && board.isCaseEmpty(new Square(offset,2)) && board.isCaseEmpty(new Square(offset,3)))
                    lcase.push(new Square(offset,2));
            }
        }               
        return lcase;
    }
}