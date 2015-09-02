<?php

/**
 * Set configuration of your phile installation.
 *
 * You can also overwrite Phile-defaults here.
 */
$config = [];

/**
 * encryption key
 */
$config['encryptionKey'] = '28gxCU4PwZ7(VUrmpY1rAezQwxAGKJkdd6y2X2Iaih2}Z(6X)c)gknZpvE=SQx1s';

/**
 * page title
 */
$config['site_title'] = 'PhileCMS';

/**
 * default theme
 */
$config['theme'] = 'congresosmx';

/**
 * include core plugins
 */
$config['plugins']['phile\\phpFastCache'] = ['active' => false];

/**
 * demo plugin
 */
// $config['plugins']['mycompany\\demoPlugin'] = ['active' => true];

return $config;
