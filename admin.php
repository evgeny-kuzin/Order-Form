<?php

function tt_order_form_dashboard_link()
{
    add_options_page('TT Order Form', 'TT Order Form', 'edit_posts', 'tt_order_form', 'tt_order_form_options_page');
}

add_action('admin_menu', 'tt_order_form_dashboard_link');


function tt_order_form_options_page(){


    if (isset($_POST['tt-order-form'])) {

        update_option("ttorderform_card|value", esc_attr($_POST['ttorderform_card|value']));
        update_option("ttorderform_card|status", (!isset($_POST['ttorderform_card|status'])) ? 'off' : 'on');
        update_option("ttorderform_redirect_url|value", esc_url($_POST['ttorderform_redirect_url|value']));
        update_option("ttorderform_type_of_paper|label", $_POST['ttorderform_type_of_paper|label']);

        update_option("ttorderform_topic|label", $_POST['ttorderform_topic|label']);
        update_option("ttorderform_subject|label", $_POST['ttorderform_subject|label']);
        update_option("ttorderform_quantity|label", $_POST['ttorderform_quantity|label']);
        update_option("ttorderform_deadline|label", $_POST['ttorderform_deadline|label']);
        update_option("ttorderform_details|label", $_POST['ttorderform_details|label']);
        update_option("ttorderform_button|label", $_POST['ttorderform_button|label']);


        update_option("ttorderform_col1|title", $_POST['ttorderform_col1|title']);
        update_option("ttorderform_col2|title", $_POST['ttorderform_col2|title']);
        update_option("ttorderform_col3|title", $_POST['ttorderform_col3|title']);
        update_option("ttorderform_col1|items", $_POST['ttorderform_col1|items']);
        update_option("ttorderform_col2|items", $_POST['ttorderform_col2|items']);
        update_option("ttorderform_col3|items", $_POST['ttorderform_col3|items']);

        update_option("ttorderform_slide1|title", $_POST['ttorderform_slide1|title']);
        update_option("ttorderform_slide2|title", $_POST['ttorderform_slide2|title']);
        update_option("ttorderform_slide3|title", $_POST['ttorderform_slide3|title']);
        update_option("ttorderform_slide1|subtitle", $_POST['ttorderform_slide1|subtitle']);
        update_option("ttorderform_slide2|subtitle", $_POST['ttorderform_slide2|subtitle']);
        update_option("ttorderform_slide3|subtitle", $_POST['ttorderform_slide3|subtitle']);

        ?>
        <div class="notice notice-success is-dismissible">
            <p>Settings updated.</p>
        </div>
        <?php
    }


?>

    <div class="wrap">





        <h1>Order Form Settings</h1>

        <form method="post" novalidate="novalidate">

            <table class="form-table" name="form">
                <tbody>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row">
                        <label for="blogname">Redirect to URL</label>
                    </th>
                    <td>
                        <input name="ttorderform_redirect_url|value" placeholder="essays.sitename.com" type="text"  value="<?php echo get_option( "ttorderform_redirect_url|value"); ?>" class="regular-text">
                        <p class="description" >Redirect from Order Form to URL after click `ORDER`</p>
                    </td>
                </tr>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row"><label for="blogdescription">Area <i>'Card'</i></label></th>
                    <td>
                        <textarea name="ttorderform_card|value" type="text" aria-describedby="tagline-description"  class="regular-text"><?php echo esc_attr(get_option( "ttorderform_card|value")); ?></textarea>
                        <br/>
                        <input class="regular-text" name="ttorderform_card|status" type="checkbox" <?php if  (get_option( "ttorderform_card|status") == 'on') echo 'checked'; ?>  /> On/Off
                    </td>
                </tr>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row"><label for="blogdescription">Field <i>'Type of paper'</i></label></th>
                    <td>
                        <input name="ttorderform_type_of_paper|label" type="text" aria-describedby="tagline-description" value="<?php echo get_option( "ttorderform_type_of_paper|label"); ?>" class="regular-text">
                    </td>
                </tr>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row"><label for="blogdescription">Field <i>'Topic'</i></label></th>
                    <td>
                        <input name="ttorderform_topic|label" type="text" aria-describedby="tagline-description" value="<?php echo get_option( "ttorderform_topic|label"); ?>" class="regular-text">
                    </td>
                </tr>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row"><label for="blogdescription">Field <i>'Subject'</i></label></th>
                    <td>
                        <input name="ttorderform_subject|label" type="text" aria-describedby="tagline-description" value="<?php echo get_option( "ttorderform_subject|label"); ?>" class="regular-text">
                    </td>
                </tr>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row"><label for="blogdescription">Field <i>'Quantity'</i></label></th>
                    <td>
                        <input name="ttorderform_quantity|label" type="text" aria-describedby="tagline-description" value="<?php echo get_option( "ttorderform_quantity|label"); ?>" class="regular-text">
                    </td>
                </tr>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row"><label for="blogdescription">Field <i>'Deadline'</i></label></th>
                    <td>
                        <input name="ttorderform_deadline|label" type="text" aria-describedby="tagline-description" value="<?php echo get_option( "ttorderform_deadline|label"); ?>" class="regular-text">
                    </td>
                </tr>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row"><label for="blogdescription">Field <i>'Paper details/instructions'</i></label></th>
                    <td>
                        <input name="ttorderform_details|label" type="text" aria-describedby="tagline-description" value="<?php echo get_option( "ttorderform_details|label"); ?>" class="regular-text">
                    </td>
                </tr>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row"><label for="blogdescription">Button <i>'Order Now'</i></label></th>
                    <td>
                        <input name="ttorderform_button|label" type="text" aria-describedby="tagline-description" value="<?php echo get_option( "ttorderform_button|label"); ?>" class="regular-text">
                    </td>
                </tr>

                <!--   **************************************************** -->
                <!--   **************************************************** -->
                <!--   **************************************************** -->

                <tr>
                    <th scope="row"><label for="blogdescription">Field <i>'Type of service'</i></label></th>
                    <td>
                        <input name="ttorderform_type_of_service|label" type="text" aria-describedby="tagline-description" value="<?php echo get_option( "ttorderform_type_of_service|label"); ?>" class="regular-text">
                        <br/>
                        <input class="regular-text" name="ttorderform_type_of_service|status" type="checkbox" <?php if  (get_option( "ttorderform_type_of_service|status") == 'on') echo 'checked'; ?>  /> On/Off
                    </td>
                </tr>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row"><label for="blogdescription">Field <i>'Format of citation'</i></label></th>
                    <td>
                        <input name="ttorderform_format_citation|label" type="text" aria-describedby="tagline-description" value="<?php echo get_option( "ttorderform_format_citation|label"); ?>" class="regular-text">
                        <br/>
                        <input class="regular-text" name="ttorderform_format_citation|status" type="checkbox" <?php if  (get_option( "ttorderform_format_citation|status") == 'on') echo 'checked'; ?>  /> On/Off
                    </td>
                </tr>
                <!--   **************************************************** -->
                <tr>
                    <th scope="row"><label for="blogdescription">Button <i>'Academic Level'</i></label></th>
                    <td>
                        <input name="ttorderform_academic_level|label" type="text" aria-describedby="tagline-description" value="<?php echo get_option( "ttorderform_academic_level|label"); ?>" class="regular-text">
                        <br/>
                        <input class="regular-text" name="ttorderform_academic_level|status" type="checkbox" <?php if  (get_option( "ttorderform_academic_level|status") == 'on') echo 'checked'; ?>  /> On/Off
                    </td>
                </tr>
                <!--   **************************************************** -->
                <!--   **************************************************** -->
                <!--   **************************************************** -->
                </tbody>
            </table>

            <!--    ****************************************************** *********************************************-->

            <h1>Footer 3 columns</h1>

            <div style="height:250px;"   class="metabox-holder">
                <div id="postbox-container-1" class="postbox-container">
                    <div id="wpseo-dashboard-overview" class="postbox">
                        <button type="button" class="handlediv" aria-expanded="true">
                            <span class="screen-reader-text"></span>
                            <span class="toggle-indicator" aria-hidden="true"></span>
                        </button>
                        <h2 class="hndle ui-sortable-handle"><span>Column 1</span></h2>
                        <div class="inside">

                                <div>
                                    <div class="seo-assessment SeoAssessment__SeoAssessmentContainer-eFchkj kSncRk">

                                        <table class="form-table" name="form">
                                            <tbody>
                                            <!--   **************************************************** -->
                                            <tr>
                                                <th scope="row">
                                                    <label for="blogname">Title 1-column</label>
                                                </th>
                                                <td>
                                                    <input name="ttorderform_col1|title" placeholder="Columt 1 - Title" type="text"  value="<?php echo get_option( "ttorderform_col1|title"); ?>" class="">
                                                </td>
                                            </tr>
                                            <!--   **************************************************** -->
                                            <tr>
                                                <th scope="row"><label for="blogdescription">Items column 1</label></th>
                                                <td>
                                                    <textarea name="ttorderform_col1|items" type="text" aria-describedby="tagline-description"  class=""><?php echo esc_attr(get_option( "ttorderform_col1|items")); ?></textarea>
                                                </td>
                                            </tr>
                                            <!--   **************************************************** -->
                                            </tbody>
                                        </table>


                                    </div>
                                </div>

                        </div>
                    </div>
                </div>

                <div id="postbox-container-2" class="postbox-container">
                    <div id="wpseo-dashboard-overview" class="postbox">
                        <button type="button" class="handlediv" aria-expanded="true">
                            <span class="screen-reader-text"></span>
                            <span class="toggle-indicator" aria-hidden="true"></span>
                        </button>
                        <h2 class="hndle ui-sortable-handle"><span>Column 2</span></h2>
                        <div class="inside">

                            <table class="form-table" name="form">
                                <tbody>
                                <!--   **************************************************** -->
                                <tr>
                                    <th scope="row">
                                        <label for="blogname">Title 2-column</label>
                                    </th>
                                    <td>
                                        <input name="ttorderform_col2|title" placeholder="Columt 2 - Title" type="text"  value="<?php echo get_option( "ttorderform_col2|title"); ?>" class="">
                                    </td>
                                </tr>
                                <!--   **************************************************** -->
                                <tr>
                                    <th scope="row"><label for="blogdescription">Items column 2</label></th>
                                    <td>
                                        <textarea name="ttorderform_col2|items" type="text" aria-describedby="tagline-description"  class=""><?php echo esc_attr(get_option( "ttorderform_col2|items")); ?></textarea>
                                    </td>
                                </tr>
                                <!--   **************************************************** -->
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>

                <div id="postbox-container-3" class="postbox-container">
                    <div id="wpseo-dashboard-overview" class="postbox">
                        <button type="button" class="handlediv" aria-expanded="true">
                            <span class="screen-reader-text"></span>
                            <span class="toggle-indicator" aria-hidden="true"></span>
                        </button>
                        <h2 class="hndle ui-sortable-handle"><span>Column 3</span></h2>
                        <div class="inside">

                            <table class="form-table" name="form">
                                <tbody>
                                <!--   **************************************************** -->
                                <tr>
                                    <th scope="row">
                                        <label for="blogname">Title 3-column</label>
                                    </th>
                                    <td>
                                        <input name="ttorderform_col3|title" placeholder="Columt 3 - Title" type="text"  value="<?php echo get_option( "ttorderform_col3|title"); ?>" class="">
                                    </td>
                                </tr>
                                <!--   **************************************************** -->
                                <tr>
                                    <th scope="row"><label for="blogdescription">Items column 3</label></th>
                                    <td>
                                        <textarea name="ttorderform_col3|items" type="text" aria-describedby="tagline-description"  class=""><?php echo esc_attr(get_option( "ttorderform_col3|items")); ?></textarea>
                                    </td>
                                </tr>
                                <!--   **************************************************** -->
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>
            </div>


            <h1>Footer Slider Steps</h1>

            <div style="height:250px;"   class="metabox-holder">
                <div id="postbox-container-1" class="postbox-container">
                    <div id="wpseo-dashboard-overview" class="postbox">
                        <button type="button" class="handlediv" aria-expanded="true">
                            <span class="screen-reader-text"></span>
                            <span class="toggle-indicator" aria-hidden="true"></span>
                        </button>
                        <h2 class="hndle ui-sortable-handle"><span>Slide 1</span></h2>
                        <div class="inside">

                            <div>
                                <div class="seo-assessment SeoAssessment__SeoAssessmentContainer-eFchkj kSncRk">

                                    <table class="form-table" name="form">
                                        <tbody>
                                        <!--   **************************************************** -->
                                        <tr>
                                            <th scope="row">
                                                <label for="blogname">Title 1-Slide</label>
                                            </th>
                                            <td>
                                                <input name="ttorderform_slide1|title" placeholder="Title" type="text"  value="<?php echo get_option( "ttorderform_slide1|title"); ?>" class="">
                                            </td>
                                        </tr>
                                        <!--   **************************************************** -->
                                        <tr>
                                            <th scope="row"><label for="blogdescription">Subtitle 1-Slide</label></th>
                                            <td>
                                                <textarea placeholder="Subtitle" name="ttorderform_slide1|subtitle" type="text" aria-describedby="tagline-description"  class=""><?php echo esc_attr(get_option( "ttorderform_slide1|subtitle")); ?></textarea>
                                            </td>
                                        </tr>
                                        <!--   **************************************************** -->
                                        </tbody>
                                    </table>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div id="postbox-container-2" class="postbox-container">
                    <div id="wpseo-dashboard-overview" class="postbox">
                        <button type="button" class="handlediv" aria-expanded="true">
                            <span class="screen-reader-text"></span>
                            <span class="toggle-indicator" aria-hidden="true"></span>
                        </button>
                        <h2 class="hndle ui-sortable-handle"><span>Slide 2</span></h2>
                        <div class="inside">

                            <div>
                                <div class="seo-assessment SeoAssessment__SeoAssessmentContainer-eFchkj kSncRk">

                                    <table class="form-table" name="form">
                                        <tbody>
                                        <!--   **************************************************** -->
                                        <tr>
                                            <th scope="row">
                                                <label for="blogname">Title 2-Slide</label>
                                            </th>
                                            <td>
                                                <input name="ttorderform_slide2|title" placeholder="Title" type="text"  value="<?php echo get_option( "ttorderform_slide2|title"); ?>" class="">
                                            </td>
                                        </tr>
                                        <!--   **************************************************** -->
                                        <tr>
                                            <th scope="row"><label for="blogdescription">Subtitle 2-Slide</label></th>
                                            <td>
                                                <textarea placeholder="Subtitle" name="ttorderform_slide2|subtitle" type="text" aria-describedby="tagline-description"  class=""><?php echo esc_attr(get_option( "ttorderform_slide2|subtitle")); ?></textarea>
                                            </td>
                                        </tr>
                                        <!--   **************************************************** -->
                                        </tbody>
                                    </table>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div id="postbox-container-3" class="postbox-container">
                    <div id="wpseo-dashboard-overview" class="postbox">
                        <button type="button" class="handlediv" aria-expanded="true">
                            <span class="screen-reader-text"></span>
                            <span class="toggle-indicator" aria-hidden="true"></span>
                        </button>
                        <h2 class="hndle ui-sortable-handle"><span>Slide 3</span></h2>
                        <div class="inside">

                            <table class="form-table" name="form">
                                <tbody>
                                <!--   **************************************************** -->
                                <tr>
                                    <th scope="row">
                                        <label for="blogname">Title 3-Slide</label>
                                    </th>
                                    <td>
                                        <input name="ttorderform_slide3|title" placeholder="Title" type="text"  value="<?php echo get_option( "ttorderform_slide3|title"); ?>" class="">
                                    </td>
                                </tr>
                                <!--   **************************************************** -->
                                <tr>
                                    <th scope="row"><label for="blogdescription">Subtitle 3-Slide</label></th>
                                    <td>
                                        <textarea placeholder="Subtitle" name="ttorderform_slide3|subtitle" type="text" aria-describedby="tagline-description"  class=""><?php echo esc_attr(get_option( "ttorderform_slide3|subtitle")); ?></textarea>
                                    </td>
                                </tr>
                                <!--   **************************************************** -->
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>
            </div>

            <style>
                .postbox{margin-right: 10px;}
            </style>
            <p class="submit">
                <input type="submit" name="tt-order-form" id="submit" class="button button-primary" value="Save Changes">
            </p>


        </form>


    </div>
<?php
}