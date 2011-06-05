<?php

 if(isset($_GET['q']) && isAjax())
 {
	$q = strip_tags($_GET['q']);
	header("Status: 200");
	header("Content-type: text/xml");
	echo  file_get_contents($q,0);   
	exit();
 }
 
function isAjax() {
	return (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
	($_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest'));
}
?>
