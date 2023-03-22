export default class KDTree{

	constructor(points,dimensions,depth=0){
		this.n = points.length;
		this.dimensions = dimensions;
		if (this.n <= 0) return null;
	
		let pts, median, left, right;

		if(points.length >1){
			pts = points.slice();
			let split = this.split_median(pts,dimensions,depth);
			median = split.median;
			left = split.left;
			right = split.right;
		}else{
			median = points[0];
			left = [];
			right = [];
		}
		this.point = median;

		if (left.length > 0)
			this.left = new KDTree(left,dimensions,(depth+1) % dimensions.length);
		else
			this.left = null;

		if (right.length > 0)
			this.right = new KDTree(right,dimensions,(depth+1) % dimensions.length);
		else
			this.right = null;

	}

	nearest_within_R(query_point, R, depth=0){
    
		const R_squared = R**2;
		const squared_distance_to_point = this.distance(this.point,query_point);
		const distance_to_hyperplane = query_point[this.dimensions[depth]] - this.hyperplane(depth);
		const squared_distance_to_hyperplane = distance_to_hyperplane**2;
    
		// check if the current point lies within the ball defined by R and
		// if yes, save it
		let ball = [];        
		if (squared_distance_to_point<=R_squared){
			/*ball.push({ 
                  point: self.point,
                  squared_distance: squared_distance_to_point
                });*/

			ball.push(this.point);
		}
    
		let this_half, other_half;
    
		if (distance_to_hyperplane<0){
			this_half = this.left;
			other_half = this.right;
		} else {
			this_half = this.right;
			other_half = this.left;
		}
    
		// the query point lies within one of the subspaces this tree node potentially 
		// points to. Check this subspace for all possible points that lie within distance R
		if (this_half !== null){
			const deeper_ball = this_half.nearest_within_R(query_point, R, (depth+1) % this.dimensions);
			ball = ball.concat(deeper_ball);
		}
    
		// if the hyperplane of the current tree node and the query point lie
		// farther apart than R, we can exclude the other subspace and do not need to search it.
		// If they cross, we need to search it.
		if ((squared_distance_to_hyperplane < R_squared) && (other_half !== null)){
			const deeper_ball = other_half.nearest_within_R(query_point, R, (depth+1) % this.dimensions);
			ball = ball.concat(deeper_ball);
		}
    
		return ball;
	}

	split_median(points,dimensions,dim){
		dim = dimensions[dim];
		let pts = points.sort((a, b) => a[dim]-b[dim] );
		let middle = Math.floor(pts.length / 2);
		let median = pts[middle];
		let left = pts.slice(0,middle); 
		let right = pts.slice(middle+1); 
		return {
			left: left,
			median: median,
			right: right
		};
	}

	distance(point1,point2){	
		let x1 = point1.x;
		let y1 = point1.y;

		let x2 = point2.x;
		let y2 = point2.y;

		//console.log(`${x1},${y1}`);
		let dx = x1 - x2;
		let dy = y1 - y2;
		return Math.sqrt(dx* dx + dy * dy);
	}
	hyperplane(depth){
		return this.point[
            this.dimensions[depth]
		];
	}
}
