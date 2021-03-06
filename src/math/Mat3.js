/*global CANNON:true */

/**
 * @class CANNON.Mat3
 * @brief Produce a 3x3 matrix. Columns first!
 * @param array elements Array of nine elements. Optional.
 * @author schteppe / http://github.com/schteppe
 */
CANNON.Mat3 = function(elements){
  /**
   * @property Float32Array elements
   * @memberof CANNON.Mat3
   * @brief A vector of length 9, containing all matrix elements
   */
  if(elements){
    this.elements = new Float32Array(elements);
  } else {
    this.elements = new Float32Array(9);
  }
};

/**
 * @fn identity
 * @memberof CANNON.Mat3
 * @brief Sets the matrix to identity
 * @todo Should perhaps be renamed to setIdentity() to be more clear.
 * @todo Create another function that immediately creates an identity matrix eg. eye()
 */
CANNON.Mat3.prototype.identity = function(){
  this.elements[0] = 1;
  this.elements[1] = 0;
  this.elements[2] = 0;

  this.elements[3] = 0;
  this.elements[4] = 1;
  this.elements[5] = 0;

  this.elements[6] = 0;
  this.elements[7] = 0;
  this.elements[8] = 1;
};

/**
 * @fn vmult
 * @memberof CANNON.vmult
 * @brief Matrix-Vector multiplication
 * @param CANNON.Vec3 v The vector to multiply with
 * @param CANNON.Vec3 target Optional, target to save the result in.
 */
CANNON.Mat3.prototype.vmult = function(v,target){
  if(target===undefined){
    target = new CANNON.Vec3();
  }

  var vec = [v.x, v.y, v.z];
  var targetvec = [0, 0, 0];
  for(var i=0; i<3; i++){
    for(var j=0; j<3; j++){
      targetvec[i] += this.elements[i+3*j]*vec[i];
    }
  }

  target.x = targetvec[0];
  target.y = targetvec[1];
  target.z = targetvec[2];
  return target;
};

/**
 * @fn smult
 * @memberof CANNON.Mat3
 * @brief Matrix-scalar multiplication
 * @param float s
 */
CANNON.Mat3.prototype.smult = function(s){
  for(var i=0; i<this.elements.length; i++){
    this.elements[i] *= s;
  }
};

/**
 * @fn mmult
 * @memberof CANNON.Mat3
 * @brief Matrix multiplication
 * @param CANNON.Mat3 m Matrix to multiply with from left side.
 * @return CANNON.Mat3 The result.
 */
CANNON.Mat3.prototype.mmult = function(m){
  var r = new CANNON.Mat3();
  for(var i=0; i<3; i++){
    for(var j=0; j<3; j++){
      var sum = 0.0;
      for(var k=0; k<3; k++){
	sum += this.elements[i+k] * m.elements[k+j*3];
      }
      r.elements[i+j*3] = sum;
    }
  }
  return r;
};

/**
 * @fn solve
 * @memberof CANNON.Mat3
 * @brief Solve Ax=b
 * @param CANNON.Vec3 b The right hand side
 * @param CANNON.Vec3 target Optional. Target vector to save in.
 * @return CANNON.Vec3 The solution x
 */
CANNON.Mat3.prototype.solve = function(b,target){

  target = target || new CANNON.Vec3();

  // Construct equations
  var nr = 3; // num rows
  var nc = 4; // num cols
  var eqns = new Float32Array(nr*nc);
  var i,j;
  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      eqns[i+nc*j] = this.elements[i+3*j];
    }
  }
  eqns[3+4*0] = b.x;
  eqns[3+4*1] = b.y;
  eqns[3+4*2] = b.z;
  
  // Compute right upper triangular version of the matrix - Gauss elimination
  var n = 3, k = n, np;
  var kp = 4; // num rows
  var p, els;
  do {
    i = k - n;
    if (eqns[i+nc*i] === 0) {
      for (j = i + 1; j < k; j++) {
	if (eqns[i+nc*j] !== 0) {
	  els = [];
	  np = kp;
	  do {
	    p = kp - np;
	    els.push(eqns[p+nc*i] + eqns[p+nc*j]);
	  } while (--np);
	  eqns[i+nc*0] = els[0];
	  eqns[i+nc*1] = els[1];
	  eqns[i+nc*2] = els[2];
	  break;
	}
      }
    }
    if (eqns[i+nc*i] !== 0) {
      for (j = i + 1; j < k; j++) {
	var multiplier = eqns[i+nc*j] / eqns[i+nc*i];
	els = [];
	np = kp;
	do {
	  p = kp - np;
	  els.push(p <= i ? 0 : eqns[p+nc*j] - eqns[p+nc*i] * multiplier);
	} while (--np);
	eqns[j+nc*0] = els[0];
	eqns[j+nc*1] = els[1];
	eqns[j+nc*2] = els[2];
      }
    }
  } while (--n);
  // Get the solution
  target.z = eqns[2*nc+3] / eqns[2*nc+2];
  target.y = (eqns[1*nc+3] - eqns[1*nc+2]*target.z) / eqns[1*nc+1];
  target.x = (eqns[0*nc+3] - eqns[0*nc+2]*target.z - eqns[0*nc+1]*target.y) / eqns[0*nc+0];

  if(isNaN(target.x) || isNaN(target.y) || isNaN(target.z) || target.x===Infinity || target.y===Infinity || target.z===Infinity){
    throw "Could not solve equation! Got x=["+target.toString()+"], b=["+b.toString()+"], A=["+this.toString()+"]";
  }

  return target;
};

/**
 * @fn e
 * @memberof CANNON.Mat3
 * @brief Get an element in the matrix by index. Index starts at 0, not 1!!!
 * @param int i
 * @param int j
 * @param float value Optional. If provided, the matrix element will be set to this value.
 * @return float
 */
CANNON.Mat3.prototype.e = function(i,j,value){
  if(value===undefined){
    return this.elements[i+3*j];
  } else {
    // Set value
    this.elements[i+3*j] = value;
  }
};

/**
 * @fn copy
 * @memberof CANNON.Mat3
 * @brief Copy the matrix
 * @param CANNON.Mat3 target Optional. Target to save the copy in.
 * @return CANNON.Mat3
 */
CANNON.Mat3.prototype.copy = function(target){
  target = target || new CANNON.Mat3();
  for(var i=0; i<this.elements.length; i++){
    target.elements[i] = this.elements[i];
  }
  return target;
};

/**
 * @fn toString
 * @memberof CANNON.Mat3
 * @brief Returns a string representation of the matrix.
 * @return string
 */
CANNON.Mat3.prototype.toString = function(){
  var r = "";
  var sep = ",";
  for(var i=0; i<9; i++){
    r += this.elements[i] + sep;
  }
  return r;
};