<?php
echo "Hello! PHP server is working!";
echo "<br>Current time: " . date('Y-m-d H:i:s');
echo "<br>Request URI: " . $_SERVER['REQUEST_URI'];
echo "<br>Script name: " . $_SERVER['SCRIPT_NAME'];
?> 